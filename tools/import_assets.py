#!/usr/bin/env python3
"""Pull the original art and rooms out of the user's Glider install into public/assets.

Run from anywhere with: python3 -I tools/import_assets.py
The output stays local placeholder art: it is copyrighted and must not ship publicly.
"""
import json
import os
import struct
import sys
import zlib

GAME_DIR = os.path.expanduser("~/Games/Prefixes/GLIDER/drive_c/Glider")
WINE_FONTS = os.path.expanduser("~/Games/Runtime/Wine Staging.app/Contents/Resources/wine/share/wine/fonts")
SYSTEM_FONT = os.path.join(WINE_FONTS, "vgasys.fon")
SMALL_FONT = os.path.join(WINE_FONTS, "smalle.fon")
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")

BITMAP_TYPE = 0x8002
FONT_TYPE = 0x8008
SPRITE_COLOR, SPRITE_MASK = 27, 1
AIR_UP_COLOR, AIR_UP_MASK = 19, 18
PANEL_LEFT, PANEL_RIGHT = 2, 3
# Room backPictID -> bitmap resource. Only the Welcome room's background is confirmed so far.
BACKGROUNDS = {200: 7}
FONT_COLUMNS = 16

ROOM_BASE, ROOM_SIZE, ROOM_COUNT = 1270, 314, 40
OBJECT_BASE, OBJECT_SIZE = 58, 16


def read_resources(path, wanted_type):
    d = open(path, "rb").read()
    lfanew = struct.unpack_from("<I", d, 0x3c)[0]
    table = struct.unpack_from("<H", d, lfanew + 0x24)[0] + lfanew
    shift = struct.unpack_from("<H", d, table)[0]
    p = table + 2
    found = {}
    while True:
        res_type, count = struct.unpack_from("<HH", d, p)
        if res_type == 0:
            return found
        p += 8
        for _ in range(count):
            off, length, _flags, res_id = struct.unpack_from("<HHHH", d, p)
            p += 12
            if res_type == wanted_type:
                found[res_id & 0x7fff] = d[off << shift:(off + length) << shift]


def decode_dib(blob):
    """Return (width, height, rows of RGB tuples) for a 1- or 4-bit Windows DIB."""
    header, w, h, _planes, bpp = struct.unpack_from("<IiiHH", blob, 0)
    used = struct.unpack_from("<I", blob, 32)[0]
    colors = used or (1 << bpp)
    palette = [(blob[header + i * 4 + 2], blob[header + i * 4 + 1], blob[header + i * 4])
               for i in range(colors)]
    bits = header + colors * 4
    stride = ((w * bpp + 31) // 32) * 4
    rows = []
    for y in range(h):
        row = blob[bits + (h - 1 - y) * stride:bits + (h - y) * stride]
        if bpp == 4:
            rows.append([palette[(row[x // 2] >> (0 if x & 1 else 4)) & 15] for x in range(w)])
        else:
            rows.append([palette[(row[x // 8] >> (7 - x % 8)) & 1] for x in range(w)])
    return w, h, rows


def write_png(path, w, h, rows):
    raw = b"".join(b"\0" + bytes(c for px in row for c in px) for row in rows)

    def chunk(tag, body):
        return struct.pack(">I", len(body)) + tag + body + struct.pack(">I", zlib.crc32(tag + body))

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


def write_masked(bitmaps, color_id, mask_id, name):
    w, h, color = decode_dib(bitmaps[color_id])
    _, _, mask = decode_dib(bitmaps[mask_id])
    # The game ANDs the mask onto the screen, so black mask pixels are the sprite's solid area.
    rows = [[color[y][x] + (255 if mask[y][x][0] < 128 else 0,) for x in range(w)] for y in range(h)]
    write_png(os.path.join(OUT_DIR, name), w, h, rows)


def write_opaque(bitmaps, res_id, name):
    w, h, rows = decode_dib(bitmaps[res_id])
    write_png(os.path.join(OUT_DIR, name), w, h, [[px + (255,) for px in row] for row in rows])


def write_font(path, name, wanted_height):
    """Turn one of Wine's Windows bitmap fonts into a white-on-clear atlas plus glyph widths."""
    sizes = read_resources(path, FONT_TYPE).values()
    fnt = min(sizes, key=lambda f: abs(struct.unpack_from("<H", f, 88)[0] - wanted_height))
    version = struct.unpack_from("<H", fnt, 0)[0]
    height = struct.unpack_from("<H", fnt, 88)[0]
    first, last = fnt[95], fnt[96]
    entry_size, table = (6, 148) if version >= 0x300 else (4, 118)

    glyphs = []
    for i in range(last - first + 1):
        entry = table + i * entry_size
        width = struct.unpack_from("<H", fnt, entry)[0]
        offset = struct.unpack_from("<I" if entry_size == 6 else "<H", fnt, entry + 2)[0]
        rows = [[False] * width for _ in range(height)]
        # Glyphs are stored as columns of bytes, each column one pixel-row-per-byte tall.
        for column in range((width + 7) // 8):
            for y in range(height):
                byte = fnt[offset + column * height + y]
                for bit in range(8):
                    x = column * 8 + bit
                    if x < width and byte & (0x80 >> bit):
                        rows[y][x] = True
        glyphs.append((width, rows))

    cell = max(g[0] for g in glyphs)
    lines = (len(glyphs) + FONT_COLUMNS - 1) // FONT_COLUMNS
    atlas = [[(255, 255, 255, 0)] * (cell * FONT_COLUMNS) for _ in range(height * lines)]
    for i, (width, rows) in enumerate(glyphs):
        ox, oy = (i % FONT_COLUMNS) * cell, (i // FONT_COLUMNS) * height
        for y in range(height):
            for x in range(width):
                if rows[y][x]:
                    atlas[oy + y][ox + x] = (255, 255, 255, 255)
    write_png(os.path.join(OUT_DIR, name + ".png"), cell * FONT_COLUMNS, height * lines, atlas)
    with open(os.path.join(OUT_DIR, name + ".json"), "w") as f:
        json.dump({"cell": cell, "height": height, "columns": FONT_COLUMNS, "first": first,
                   "widths": [g[0] for g in glyphs]}, f)


def read_house(path):
    d = open(path, "rb").read()
    rooms = []
    for i in range(ROOM_COUNT):
        r = d[ROOM_BASE + i * ROOM_SIZE:ROOM_BASE + (i + 1) * ROOM_SIZE]
        count, back = struct.unpack_from(">HH", r, 26)
        objects = []
        for j in range(count):
            kind, top, left, bottom, right, amount, extra, is_on = struct.unpack_from(
                ">H4hHHH", r, OBJECT_BASE + j * OBJECT_SIZE)
            objects.append({"type": kind, "x": left, "y": top, "w": right - left, "h": bottom - top,
                            "amount": amount, "extra": extra, "isOn": is_on})
        rooms.append({
            "name": r[1:1 + r[0]].decode("mac_roman"),
            "backPict": back,
            "tiles": list(struct.unpack_from(">8H", r, 30)),
            "leftOpen": r[46] != 0,
            "rightOpen": r[47] != 0,
            "objects": objects,
        })
    return rooms


def main():
    if not os.path.isdir(GAME_DIR):
        sys.exit("Glider install not found at " + GAME_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)
    bitmaps = read_resources(os.path.join(GAME_DIR, "GLIDER.EXE"), BITMAP_TYPE)
    write_masked(bitmaps, SPRITE_COLOR, SPRITE_MASK, "sprites.png")
    write_masked(bitmaps, AIR_UP_COLOR, AIR_UP_MASK, "air-up.png")
    write_opaque(bitmaps, PANEL_LEFT, "panel-left.png")
    write_opaque(bitmaps, PANEL_RIGHT, "panel-right.png")
    for pict_id, res_id in BACKGROUNDS.items():
        write_opaque(bitmaps, res_id, "back-%d.png" % pict_id)
    write_font(SYSTEM_FONT, "font", 16)
    write_font(SMALL_FONT, "font-small", 11)
    with open(os.path.join(OUT_DIR, "house.json"), "w") as f:
        json.dump(read_house(os.path.join(GAME_DIR, "HOUSE.GHS")), f, indent=1)


main()
