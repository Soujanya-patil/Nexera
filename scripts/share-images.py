"""
Share images (Open Graph / Twitter, 1200x630 JPG) for product pages and articles, written to public/og/.
Run by hand when a product's or article's share image should change (not part of `npm run build`):

    python -E -P scripts/share-images.py

Layout follows public/og-default.jpg (dark green ground, the NEXERA wordmark top left) and the /products
hero stage (the product on a glowing green floor line, warm dusk glow, contact shadow, faint
reflection). Every word is the site's own: partner, product name, figure and segment from
src/data/products.js (copied below), the article's eyebrow, headline and intro from src/data/articles.js.
Images are the catalogue's official cut-outs (src/assets/catalogue). Type: IBM Plex Sans (public/fonts);
characters it lacks (the ∞ in Hithium's names) fall back to Segoe UI, as they do on the site.
Needs Pillow and fontTools (with brotli, for the .woff2 fonts).
"""
import io
import os
import sys

from fontTools.ttLib import TTFont
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og")
W, H = 1200, 630
GREEN = (134, 224, 138)
WHITE = (255, 255, 255)
PAPER = (214, 222, 216)
MUTED = (179, 196, 184)

# --- Content (from src/data/products.js and src/data/articles.js) -------------------------------------
PRODUCTS = [
    {"id": "hithium-power-cabinet-1022", "partner": "Hithium", "name": "∞Power 1022 kWh Cabinet", "figure": "1022 kWh",
     "segments": ["Commercial & Industrial", "Utility-Scale"], "image": "hithium-power-cabinet-1022.webp"},
    {"id": "hithium-power-625", "partner": "Hithium", "name": "∞Power 6.25 MWh", "figure": "6.25 MWh",
     "segments": ["Utility-Scale"], "image": "hithium-power-625.webp"},
    {"id": "clou-aqua-c25s", "partner": "CLOU", "name": "Aqua C2.5S", "figure": "2.089 MWh",
     "segments": ["Utility-Scale"], "image": "clou-aqua-c25s.webp"},
]
ARTICLES = [
    {"id": "blog-what-is-bess", "eyebrow": "Guide", "title": "What Is a BESS?", "subtitle": "A Plain Guide to Battery Energy Storage",
     "intro": "A simple explanation of battery energy storage systems: what they are, how they work and where they're used in India.",
     "lineup": [("tcl-blueark-x5.webp", 205), ("hithium-power-cabinet-1022.webp", 250), ("clou-aqua-c25s.webp", 190)]},
]

# --- Fonts -----------------------------------------------------------------------------------------------
_fonts = {}


def plex(weight, size):
    key = (weight, size)
    if key not in _fonts:
        t = TTFont(os.path.join(ROOT, "public", "fonts", f"ibm-plex-sans-latin-{weight}-normal.woff2"))
        t.flavor = None
        buf = io.BytesIO()
        t.save(buf)
        buf.seek(0)
        _fonts[key] = (ImageFont.truetype(buf, size), set(t.getBestCmap()))
    return _fonts[key]


def fallback(size):
    for name in ("seguisym.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    sys.exit("no fallback font for characters IBM Plex lacks")


def runs(text, weight, size):
    """Split text into (string, font) runs: Plex where it has the glyph, the fallback otherwise."""
    font, cmap = plex(weight, size)
    out = []
    for ch in text:
        f = font if (ord(ch) in cmap or ch == " ") else fallback(size)
        if out and out[-1][1] is f:
            out[-1][0] += ch
        else:
            out.append([ch, f])
    return out


def width(text, weight, size, tracking=0.0):
    w = sum(f.getlength(s) for s, f in runs(text, weight, size))
    return w + tracking * size * max(len(text) - 1, 0)


def draw_text(d, x, y, text, weight, size, fill, tracking=0.0):
    """Draw at baseline y; tracking in em. Returns the end x."""
    for s, f in runs(text, weight, size):
        if tracking:
            for ch in s:
                d.text((x, y), ch, font=f, fill=fill, anchor="ls")
                x += f.getlength(ch) + tracking * size
        else:
            d.text((x, y), s, font=f, fill=fill, anchor="ls")
            x += f.getlength(s)
    return x


def wrap(text, weight, size, max_w):
    lines, line = [], ""
    for word in text.split(" "):
        test = f"{line} {word}".strip()
        if line and width(test, weight, size) > max_w:
            lines.append(line)
            line = word
        else:
            line = test
    return lines + [line]


# --- Pieces ---------------------------------------------------------------------------------------------
def ground():
    """Dark green ground with a soft lighter field on the right (as og-default.jpg)."""
    img = Image.new("RGB", (W, H), (6, 22, 19))
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((560, -40, 1260, 640), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(170))
    img.paste(Image.new("RGB", (W, H), (24, 37, 36)), (0, 0), glow)
    shade = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shade).rectangle((0, H - 120, W, H), fill=140)
    img.paste(Image.new("RGB", (W, H), (3, 14, 12)), (0, 0), shade.filter(ImageFilter.GaussianBlur(70)))
    return img


def wordmark(d, x=72, y=162):
    end = draw_text(d, x, y, "NE", 600, 46, WHITE)
    end = draw_text(d, end, y, "X", 600, 46, GREEN)
    draw_text(d, end, y, "ERA", 600, 46, WHITE)
    draw_text(d, x + 2, y + 30, "POWER TECH", 400, 18, MUTED, tracking=0.24)


def pill(d, x, y, text):
    """Outlined green pill (uppercase label) with its top-left at (x, y). Returns its height."""
    size, track = 16, 0.2
    tw = width(text, 600, size, track)
    h = 34
    d.rounded_rectangle((x, y, x + tw + 30, y + h), radius=h // 2, outline=(70, 120, 76), width=2)
    draw_text(d, x + 15, y + 23, text, 600, size, GREEN, tracking=track)
    return h


def stage(img, items, cx, floor_y, box_w, gap=14):
    """Products standing on a glowing floor line: [(cut-out RGBA, height)], centred on cx."""
    scaled = []
    for cut, h in items:
        cut = cut.crop(cut.getchannel("A").getbbox())
        w = round(cut.width * h / cut.height)
        if w > box_w:
            w, h = box_w, round(cut.height * box_w / cut.width)
        scaled.append(cut.resize((w, h), Image.LANCZOS))
    total = sum(c.width for c in scaled) + gap * (len(scaled) - 1)
    left = round(cx - total / 2)
    # Warm dusk glow behind the products.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((cx - 330, floor_y - 300, cx + 330, floor_y + 90), fill=(226, 140, 70, 70))
    gd.ellipse((cx - 190, floor_y - 170, cx + 190, floor_y + 50), fill=(245, 184, 65, 60))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(80)))
    x = left
    for c in scaled:
        top = floor_y - c.height
        # Contact shadow.
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse((x + c.width * 0.06, floor_y - 7, x + c.width * 0.94, floor_y + 7), fill=(0, 0, 0, 190))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
        # Faint reflection, gone within ~a fifth of the product's height.
        ref = c.transpose(Image.FLIP_TOP_BOTTOM)
        fade_h = max(1, round(c.height * 0.2))
        fade = Image.new("L", c.size, 0)
        fd = ImageDraw.Draw(fade)
        for row in range(fade_h):
            fd.line((0, row, c.width, row), fill=round(60 * (1 - row / fade_h)))
        ref.putalpha(ImageChops.multiply(ref.getchannel("A"), fade))
        ref_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ref_layer.paste(ref, (x, floor_y + 2))
        img.alpha_composite(ref_layer)
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        layer.paste(c, (x, top))
        img.alpha_composite(layer)
        x += c.width + gap
    # Floor line (#86E08A) with its glow, fading at both ends.
    span = (cx - 280, cx + 280)
    line = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(line)
    for px in range(span[0], span[1]):
        t = (px - span[0]) / (span[1] - span[0])
        a = round(255 * min(1, min(t, 1 - t) / 0.18))
        ld.line((px, floor_y, px, floor_y + 1), fill=GREEN + (a,))
    glow_line = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow_line).rectangle((span[0] + 60, floor_y - 3, span[1] - 60, floor_y + 4), fill=GREEN + (120,))
    img.alpha_composite(glow_line.filter(ImageFilter.GaussianBlur(6)))
    img.alpha_composite(line)


def cutout(name):
    return Image.open(os.path.join(ROOT, "src", "assets", "catalogue", name)).convert("RGBA")


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}.jpg")
    img.convert("RGB").save(path, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"{path}  {os.path.getsize(path) // 1024} KB")


# --- Images ---------------------------------------------------------------------------------------------
for p in PRODUCTS:
    img = ground().convert("RGBA")
    stage(img, [(cutout(p["image"]), 360)], cx=880, floor_y=500, box_w=470)
    d = ImageDraw.Draw(img)
    wordmark(d)
    y = 236
    y += pill(d, 72, y, p["partner"].upper()) + 58  # first name baseline
    for i, line in enumerate(wrap(p["name"], 600, 50, 470)):
        draw_text(d, 72, y + i * 56, line, 600, 50, WHITE)
        last = y + i * 56
    num, unit = p["figure"].split(" ")
    y = last + 76
    end = draw_text(d, 72, y, num, 600, 66, GREEN)
    draw_text(d, end + 12, y, unit, 500, 32, GREEN)
    draw_text(d, 72, y + 40, " · ".join(p["segments"]).upper(), 600, 16, MUTED, tracking=0.2)
    draw_text(d, 72, 582, f"Supplied in India by NEXERA, authorized {p['partner']} distributor.", 400, 20, PAPER)
    save(img, p["id"])

for a in ARTICLES:
    img = ground().convert("RGBA")
    stage(img, [(cutout(n), h) for n, h in a["lineup"]], cx=900, floor_y=470, box_w=260)
    d = ImageDraw.Draw(img)
    wordmark(d)
    y = 250
    y += pill(d, 72, y, a["eyebrow"].upper()) + 70
    draw_text(d, 72, y, a["title"], 600, 64, WHITE)
    y += 58
    for line in wrap(a["subtitle"], 600, 40, 520):
        draw_text(d, 72, y, line, 600, 40, GREEN)
        y += 48
    y += 22
    for line in wrap(a["intro"], 400, 20, 575):
        draw_text(d, 72, y, line, 400, 20, PAPER)
        y += 30
    save(img, a["id"])
