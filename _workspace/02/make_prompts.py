#!/usr/bin/env python3
"""두 번째 책 doodle 스타일 영문 프롬프트 자동 생성."""
import json
from pathlib import Path

WS = Path("/Users/robin/Downloads/fairy-tale/_workspace/02")
scen = json.load(open(WS / "01_scenario.json", encoding="utf-8"))

STYLE_SUFFIX = (
    "cute hand-drawn doodle illustration, colored pencil and marker texture, "
    "visible pencil strokes and marker bleed, wobbly playful outlines drawn in dark brown marker, "
    "off-white paper background with subtle paper grain, "
    "simple expressive cartoon faces with dot eyes and small mouths, "
    "slightly imperfect childlike charm, scribble shading, "
    "kawaii children's notebook doodle style, bright cheerful palette, "
    "flat coloring with crayon texture, no text no letters no watermark no signature"
)

CHAR_SIGS = {
    "솔이": "Sori the squirrel — small brown squirrel with a big fluffy striped tail, yellow scarf with star pattern around her neck, big round dot eyes and a tiny smile",
    "두두": "Dudu the mole — chubby grey mole wearing big round glasses, red overalls with straps, small tool pouch strapped to his back",
    "까미": "Kkami the magpie — black and white feathered magpie with a tiny red beret on top of his head, carrying a small folded paper map in his beak",
    "동그리": "Donggri the raccoon — chubby raccoon in a red and yellow striped shirt, large brown backpack on his back, soft warm smile",
    "토토": "Toto the rabbit — white rabbit with very large pink ears, blue polka-dot scarf around his neck, tiny sneakers on his feet",
    "쇠북 할아버지": "Grandpa Soebuk the clock spirit — tall elderly figure with soft bronze-tinged skin, long flowing greyish-green cloak, top hat decorated with tiny bronze gears, kind slow expression",
}

# Scene 번호 → 어떤 캐릭터가 등장하는지 (visual_cues 분석 + 시나리오 흐름 기준 수동 매핑)
SCENE_CHARS = {
    1: ["솔이"],
    2: ["솔이"],
    3: ["솔이"],
    4: ["솔이"],
    5: ["솔이"],
    6: ["솔이", "두두", "까미", "동그리", "토토"],
    7: ["솔이", "두두", "까미", "동그리", "토토"],
    8: ["솔이", "두두", "까미", "동그리", "토토"],
    9: ["솔이", "두두", "까미", "동그리", "토토"],
    10: ["솔이", "두두", "까미", "동그리", "토토"],
    11: ["솔이", "두두", "까미", "동그리", "토토"],
    12: ["솔이", "두두", "까미", "동그리", "토토"],
    13: ["솔이", "두두", "까미", "동그리", "토토"],
    14: ["솔이", "두두", "까미", "동그리", "토토"],
    15: ["솔이", "두두", "까미", "동그리", "토토"],
    16: ["솔이", "두두", "까미", "동그리", "토토"],
    17: ["솔이", "두두", "까미", "동그리", "토토"],
    18: ["솔이", "두두", "까미", "동그리", "토토"],
    19: ["솔이", "두두", "까미", "동그리", "토토"],
    20: ["솔이", "두두", "까미", "동그리", "토토"],
    21: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    22: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    23: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    24: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    25: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    26: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    27: ["솔이", "두두", "까미", "동그리", "토토", "쇠북 할아버지"],
    28: ["두두", "까미", "동그리", "토토", "솔이", "쇠북 할아버지"],
    29: ["솔이", "두두", "까미", "동그리", "토토"],
    30: [],  # 야경 마을 전경 — 캐릭터 없이 마을과 시계
}

# 각 장면을 영어로 묘사 (visual_cues 한국어를 정확한 영문 시각 묘사로 번역)
SCENE_ENGLISH = {
    1: "Early morning in a cozy woodland village called Acorn Village. In the center of the village square stands a giant bronze clock tower shaped like an acorn. Small round wooden houses with mushroom-cap roofs circle around it. Soft yellow sunlight, warm and welcoming. Animals just waking up. Sori the squirrel happily bouncing into the square with her star-pattern yellow scarf swooshing. Wide horizontal composition.",
    2: "The same village square but now empty in the center — only a round flattened circle of grass remains where the giant acorn clock used to be. Sori stands frozen with both paws clutching her cheeks, tail puffed up in surprise. Other animal villagers gather and murmur in the background, looking distressed. Soft morning light. Wide composition with the empty center as focus.",
    3: "Close-up of the grass with three glowing bronze-colored footprints leading away from the clock spot toward the forest. The footprints sparkle softly. Sori crouches beside them, one paw pointing at a footprint, eyes wide with discovery. Doodle-style highlight lines around the footprints to show they glow. Wide horizontal composition.",
    4: "Village square gathering. An elderly brown pheasant (Grandma Pheasant) holding a wooden cane stands in the center, speaking gravely. The five animal friends and other villagers form a circle around her, all listening seriously. Sori looks resolute. Soft mist starts rolling in from the distant forest. Worried atmosphere.",
    5: "Sori steps one paw forward in the village square, chest puffed out and small fist raised in determination. Sunlight beams through trees onto her yellow scarf. Surrounding villagers look surprised, eyes wide and mouths slightly open. Grandma Pheasant in background nods with a warm wise smile. Heroic doodle pose.",
    6: "All five animal friends stand in a row at the village entrance under a big oak tree archway. Morning sun behind them creating a soft glow. Each character clearly visible from front: Sori with yellow star scarf and proud pose, Dudu with glasses and red overalls holding his tool pouch, Kkami the magpie with red beret holding a tiny map in beak, Donggri the raccoon in striped shirt with a big backpack, Toto the rabbit with blue scarf perking up his big pink ears. A dirt path leads into the forest behind them.",
    7: "The five friends gathered in a sunny grass clearing, all looking down at an unfolded map laid out on the grass. The map shows a stylized forest, river, and tall cliff with a clear red X mark on top of the cliff. Kkami's beak touches the X. Dudu adjusts his glasses thoughtfully. Sori points at the path. Wide overhead-angled composition.",
    8: "A V-shaped fork in the forest path. Left branch is bright sunny and full of flowers, right branch is foggy and dim. The five friends pause at the fork. Donggri tilts his head up sniffing with his nose. Toto half-hides behind Donggri's leg with worried ears. Sori looks toward the foggy right path. Other friends watching.",
    9: "The five friends walking single-file into a misty foggy forest, hand-in-hand (paw-in-paw). Twisted dark tree silhouettes on both sides. The fog is thick but not scary — gentle white swirls. Sori at front gently holds Toto's paw. Toto looks nervous but determined. The path ahead disappears into mist.",
    10: "Close-up in the misty forest. On a small patch of grass shines a single small bronze-glowing acorn. Kkami the magpie hovers above it pointing with his wing tip. Sori kneels down to inspect the glowing acorn, her face lit up with hope. The fog has slightly cleared in a circle around the acorn revealing a small ray of sunshine.",
    11: "Deep within a mysterious misty forest with very tall ancient trees curving like archways. Sori at the front carefully cradles the glowing bronze acorn in her paws. From the acorn shines a small golden arrow of light pointing forward — like a magical compass. The other four friends walk behind her in single file. Magical mood with soft glowing particles in the air.",
    12: "The five friends crouched on a grass patch in the foggy forest, ducking down in fear as a massive bird silhouette swoops overhead — wings spread wide casting a dramatic shadow. Toto covers his head with both paws. Donggri shields Sori with one arm. Kkami the magpie shoots up into the air to investigate. The big bird is mysterious but not threatening — large rounded doodle shape.",
    13: "Dudu the mole proudly holds up a long thin invention — a glowing yellow light-stick taller than himself. From the tip emits a bright cone of yellow light that pierces the fog and pushes it back in swirls. Dudu adjusts his big glasses with one paw, looking triumphant. The four other friends gather around with happily relieved faces, lit by the yellow glow.",
    14: "From over the friends' shoulders we look out — the fog clears at the edge of the forest. Before them opens a wide vista: a huge fast-flowing river stretches across, with rapids and foam. Beyond the river, a tall purple cliff silhouette rises in the distance. The five friends silhouetted against this grand view, looking out together. Awestruck mood.",
    15: "On the sandy riverbank. The five friends stand in a row facing the camera. Toto looks dejected with droopy ears, sighing. Donggri scratches the back of his head, puzzled. Dudu suddenly raises one paw triumphantly, glasses flashing with sunlight reflection. Sori looks at Dudu curiously. Kkami gazes across the river. Wide river behind them flowing fast.",
    16: "Dudu the mole pulls a small square box from his bag and tugs a string. A pop of motion lines! Out unfolds a small red-striped doodle-style sailboat with a tiny red flag — like origami unfolding. The boat sits ready on the riverbank. The four other friends stand around with wide-open mouths and shocked happy expressions, paws raised in amazement. Wide cheerful composition.",
    17: "The five friends boarding the small red-striped sailboat one by one. Sori stands proudly at the bow holding the brim of her scarf. Kkami the magpie perches at the top of the mast. Donggri sits in the middle of the boat cradling Toto in his arms. Dudu mans the rudder, glasses glinting. The boat just pushes off from the riverbank — small waves around it.",
    18: "The small red sailboat tilts dramatically to one side in turbulent river rapids! White foam splashing everywhere with squiggly doodle motion lines. The five friends all lean to one side together to balance. Toto clings tightly to Donggri's striped shirt with wide eyes. Sori grasps the mast pointing forward shouting commands. Dudu grips the rudder with both paws. Dynamic action scene.",
    19: "The boat now stable and gliding through the river — all five friends in coordinated action. Kkami hovers above the boat as scout, both wings out, pointing directions with his wing. Donggri rows with two big oars. Dudu steers the rudder. Toto pulls a rope tight. Sori at the bow with one paw raised in encouragement. Smooth water lines now. Determined teamwork mood.",
    20: "The boat just landed on a sandy beach on the other side of the river. The five friends sit on the sand catching their breath, relaxed poses with relieved smiles. Looking upward, a huge purple-grey cliff rises before them. At the top of the cliff, something glints with bronze light. The sky tinges purple-pink with early sunset. Wide composition emphasizing the cliff's height.",
    21: "Top of the tall cliff at twilight. The sky is rich purple and pink. The giant acorn-shaped bronze clock stands at the edge of the cliff. Beside it sits a tall elderly clock spirit on the ground — Grandpa Soebuk, with bronze-tinged skin, long greyish-green cloak, top hat with tiny bronze gears. He looks lonely with a gentle sad smile. The five friends just arrived at the top, freezing in awe at the cliff's edge. Solemn quiet mood.",
    22: "Grandpa Soebuk gently places his large bronze hand on the giant acorn clock. From the clock emanate warm golden bell-sound ripples spreading outward. His bronze eyes hold a soft sadness. The five friends sit on the cliff in a semi-circle around him, listening intently. Sori a step closer than the others, her expression sympathetic. Twilight purple sky behind everything.",
    23: "Tender close moment. Sori the small squirrel stands directly in front of the seated Grandpa Soebuk, reaching her two tiny paws up to clasp his large bronze hand. The size difference is touching — he is huge, she is tiny. A single faint shimmer like a tear in his bronze eye. The four other friends watch from behind with warm smiles. Background is soft glowing twilight on the cliff top.",
    24: "All six characters now together — the five friends plus Grandpa Soebuk — pushing the giant acorn clock down the cliff path. Dudu has invented two tiny red wheels attached to the bottom of the clock. Grandpa Soebuk pushes from behind with great strength. The five friends push from various positions, all calling 'Heave-ho!' with effort-faces and motion lines. Purple-orange sunset on the cliff face.",
    25: "A larger sailboat now (Dudu has made it bigger). At its center stands the giant acorn clock, emitting golden bell-sound ripples spreading across the water in concentric doodle circles. Grandpa Soebuk rows with a huge oar at the back. The five friends are gathered in joyful poses around the clock. First few stars beginning to appear in a darkening blue sky. Magical evening river crossing.",
    26: "Morning in Acorn Village square. The giant acorn clock proudly stands tall again in the center. All the village animals (rabbits, foxes, birds, mice, badgers etc.) crowd the square waving paws and cheering with confetti and tiny flags. The five friends stand directly before the clock. Next to them stands tall Grandpa Soebuk with a shy but warm smile. Morning sunlight bathes everything in golden warmth.",
    27: "Long village feast table in the village square set with acorn-shaped cakes, honey jars, colorful fruits and flowers. Village animals seated on both sides eating cheerfully. Grandpa Soebuk sits at the head of the table looking a bit shy, with Sori beside him cutting a slice of cake to hand him. Grandma Pheasant in the background nods warmly. Festive doodle confetti in the air.",
    28: "A small cozy doodle-cottage in the village. Grandpa Soebuk sits in a small wooden chair outside reading a newspaper, looking content. Dudu enthusiastically shows him a new tiny invention. Kkami draws a new map on a branch nearby. Donggri bakes bread visible through a window. Toto runs by in a blur of speed. Sori waves from the cottage rooftop. Lively bustling village life scene.",
    29: "A small grassy hilltop overlooking the village. Orange-red sunset light bathes the scene. The five friends stand in a tight circle stacking their paws together in the center — Sori's paw on top. Above them the first single bright star twinkles in the warm sky. In the distant valley the silhouette of the acorn clock can be seen. Determined hopeful mood.",
    30: "Night scene of Acorn Village from a slight aerial view. The giant acorn clock in the village square emits radiant golden bell-sound waves expanding outward in concentric doodle circles, enveloping all the warmly-lit cottages of the village. Sky full of bright twinkling stars seeming to applaud. Every cottage window glows warm yellow. No characters visible — just the magical glowing village at peace. Wide horizontal composition.",
}

def make_prompt(scene_num):
    chars = SCENE_CHARS[scene_num]
    char_descs = " ".join(CHAR_SIGS[c] for c in chars if c in CHAR_SIGS)
    desc = SCENE_ENGLISH[scene_num]
    base = (
        f"Cute hand-drawn doodle children's storybook illustration. {desc} "
    )
    if char_descs:
        base += f"Characters: {char_descs}. "
    base += STYLE_SUFFIX
    return base

cover_prompt = (
    "Cute hand-drawn doodle children's storybook cover illustration. "
    "All five animal friends standing together in a triumphant row on a small grassy hill at sunrise — Sori the squirrel proudly at the center waving up at the sky, Dudu the mole holding up his light-stick invention, Kkami the magpie flying just above with a tiny map in beak, Donggri the raccoon with backpack flexing one arm, Toto the rabbit with big pink ears jumping joyfully. Behind them in the distance the giant acorn clock and the small Acorn Village. Above is a vast cheerful sky with empty area at the top intentionally left clear for title text placement. The mood is bright adventurous and inviting. "
    "Characters: " + " ".join(CHAR_SIGS[c] for c in ["솔이","두두","까미","동그리","토토"]) + ". "
    + STYLE_SUFFIX
)

result = {
    "style_guide": {
        "art_style": "cute hand-drawn doodle illustration with colored pencil and marker texture",
        "color_palette": "bright cheerful palette — warm yellows, soft pinks, fresh greens, sky blues, with playful pops of orange and lavender on off-white paper background",
        "lighting": "flat playful lighting, hand-drawn shading with crosshatching and scribble textures",
        "composition_rule": "wide horizontal compositions, generous breathing room, characters as visual anchors",
        "style_suffix": STYLE_SUFFIX,
    },
    "character_signatures": CHAR_SIGS,
    "cover": {"filename": "cover.png", "prompt": cover_prompt},
    "scenes": [
        {"scene_number": i, "filename": f"page_{i:02d}.png", "prompt": make_prompt(i)}
        for i in range(1, 31)
    ],
}

out = WS / "02_prompts.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# 인코딩 통계
lengths = [len(s["prompt"]) for s in result["scenes"]]
print(f"cover: {len(cover_prompt)} chars")
print(f"scenes: {len(result['scenes'])} prompts, avg {sum(lengths)//len(lengths)} chars, min {min(lengths)}, max {max(lengths)}")
print(f"saved: {out}")
