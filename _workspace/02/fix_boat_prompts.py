#!/usr/bin/env python3
"""page 18·19·20 배 일관성 수정 — 시그니처 강제 + 프롬프트 재작성."""
import json
from pathlib import Path

WS = Path("/Users/robin/Downloads/fairy-tale/_workspace/02")
PROMPTS_PATH = WS / "02_prompts.json"
data = json.load(open(PROMPTS_PATH, encoding="utf-8"))

# page_17 의 빨강+흰 줄무늬 sailboat 를 표준으로 고정
BOAT_SIG = (
    "Boat signature (same boat in all river scenes): a medium-sized doodle-style wooden sailboat with "
    "RED AND WHITE horizontal striped hull made of visible wooden planks, "
    "a single tall central mast with a triangular sail showing RED AND WHITE VERTICAL STRIPES, "
    "a small red triangular pennant flag at the very top of the mast, "
    "wooden oars resting on the sides of the hull, "
    "drawn with wobbly hand-drawn outlines and colored pencil texture. "
    "Do NOT change the sail colors. Do NOT replace the sailboat with a rowboat."
)

STYLE_SUFFIX = data["style_guide"]["style_suffix"]
CHAR_SIGS = data["character_signatures"]

# object_signatures 신설
data["object_signatures"] = {
    "두두의 배": BOAT_SIG.replace("Boat signature (same boat in all river scenes): ", "")
}

def char_descs_for(names):
    return " ".join(CHAR_SIGS[c] for c in names if c in CHAR_SIGS)

# 페이지 18, 19, 20 새 프롬프트
NEW_PROMPTS = {
    18: (
        "Cute hand-drawn doodle children's storybook illustration. "
        "The small red-and-white striped sailboat tilts dramatically to one side in turbulent river rapids! "
        "White foam splashing everywhere with squiggly doodle motion lines. "
        "The five animal friends are all on board, leaning to one side together to balance the tilting boat. "
        "Toto clings tightly to Donggri's striped shirt with wide eyes. "
        "Sori at the bow grips the mast pointing forward with a determined shout. "
        "Kkami the magpie clutches the sail rope from above. "
        "Dudu grips the wooden rudder with both paws. "
        "Important: the boat is THE SAME boat from the previous pages — same red and white striped sail with red triangular pennant on top, same red-and-white striped wooden plank hull. "
        + BOAT_SIG + " "
        "Dynamic action scene with rocks visible in the rushing river. "
        "Characters: " + char_descs_for(["솔이", "두두", "까미", "동그리", "토토"]) + ". "
        + STYLE_SUFFIX
    ),
    19: (
        "Cute hand-drawn doodle children's storybook illustration. "
        "The small red-and-white striped sailboat now glides smoothly through calmer river water — "
        "all five animal friends in coordinated teamwork inside the SAME sailboat (it has a sail, it is NOT a rowboat). "
        "Kkami the magpie hovers above the boat as scout with both wings spread, pointing directions with one wing. "
        "Donggri rows from the side of the boat with two wooden oars. "
        "Dudu steers the wooden rudder at the back. "
        "Toto pulls a sail rope tight. "
        "Sori stands at the bow with one paw raised in encouragement. "
        "The triangular red-and-white striped sail is up and catching the breeze. Smooth water ripple lines around the boat. "
        "Important: the boat must look identical to the previous scenes — same red-and-white striped wooden plank hull, same tall central mast with red-and-white vertical-striped triangular sail, small red triangular flag at the top of the mast. "
        + BOAT_SIG + " "
        "Determined teamwork mood. "
        "Characters: " + char_descs_for(["솔이", "두두", "까미", "동그리", "토토"]) + ". "
        + STYLE_SUFFIX
    ),
    20: (
        "Cute hand-drawn doodle children's storybook illustration. "
        "The small red-and-white striped sailboat has just landed on a sandy beach on the other side of the river — "
        "the boat is still clearly visible at the left edge of the scene, its sail folded down a bit, hull resting on the wet sand with one wooden oar leaning against it. "
        "The five animal friends sit on the sand in front of the boat catching their breath with relieved smiles. "
        "Looking upward together, they all gaze at a huge purple-grey cliff that rises before them. "
        "At the very top of the cliff something glints with tiny bronze light. "
        "Sky tinges purple-pink with early sunset. "
        "Important: the boat in this scene must be THE SAME sailboat from the previous river-crossing pages — red-and-white striped wooden plank hull, triangular sail with red-and-white vertical stripes, red triangular flag on top. Do not draw a different boat or a plain rowboat. "
        + BOAT_SIG + " "
        "Wide composition emphasizing the cliff's grand height while keeping the recognizable boat visible. "
        "Characters: " + char_descs_for(["솔이", "두두", "까미", "동그리", "토토"]) + ". "
        + STYLE_SUFFIX
    ),
}

for s in data["scenes"]:
    n = s["scene_number"]
    if n in NEW_PROMPTS:
        s["prompt"] = NEW_PROMPTS[n]
        s.setdefault("_revisions", []).append("boat consistency fix 2026-05-22")

with open(PROMPTS_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated prompts: 18, 19, 20")
for n in [18, 19, 20]:
    p = next(s for s in data["scenes"] if s["scene_number"] == n)
    print(f"  page_{n}: {len(p['prompt'])} chars")
