---
name: art-direction
description: 동화 일러스트 비주얼 스타일 가이드 + 장면별 영문 프롬프트 작성 스킬. art-director 에이전트 전용. 시나리오 JSON 을 입력받아 codex-image (gpt-image) 가 잘 이해하는 영문 프롬프트로 변환한다. 트리거 '이미지 프롬프트 작성', '아트 디렉션', '비주얼 스타일 가이드', '동화 일러스트 프롬프트'.
---

# Art Direction — 그림책 비주얼 가이드 & 프롬프트 작성

art-director 에이전트가 사용. 시나리오를 codex-image 가 일관되게 그릴 수 있는 영문 프롬프트로 번역한다.

## 핵심 원칙

1. **단일 스타일 어휘** — 모든 페이지에서 같은 화풍/색감/조명. 표지부터 마지막 장면까지 한 명의 일러스트레이터가 그린 것처럼.
2. **style_suffix** — 모든 프롬프트 끝에 동일한 30~50단어 어구를 붙여 강제 일관성 유지.
3. **character_signature** — 주인공 외모를 한 문장으로 고정. 모든 장면 프롬프트에 그대로 포함.
4. **영어로 작성** — gpt-image 는 영어에 더 강하다. 시각 묘사 위주, 추상어휘 X.
5. **텍스트 금지** — "no text, no letters, no watermark" 를 negative 에 명시. 텍스트는 뷰어에서 오버레이.

## 추천 스타일 프리셋

### 프리셋 A: Soft Watercolor (기본 권장)
```
art_style: "Soft watercolor children's book illustration in the style of classic Korean picture books"
color_palette: "pastel and warm earth tones, sky blues and golden yellows, gentle pinks"
lighting: "soft diffused golden hour light with painterly shadows"
style_suffix: "soft watercolor children's storybook illustration, hand-painted texture, gentle pastel palette, warm golden light, dreamy and whimsical atmosphere, child-friendly, painterly brush strokes, no text no letters no watermark"
```

### 프리셋 B: Studio Ghibli-esque
```
style_suffix: "Studio Ghibli inspired hand-drawn animation style, lush nature, soft cel-shading, warm cinematic lighting, whimsical and nostalgic, no text no letters no watermark"
```

### 프리셋 C: Modern Flat (단순)
```
style_suffix: "modern flat illustration, geometric shapes, limited pastel palette, clean lines, contemporary children's book style, no text no letters no watermark"
```

### 프리셋 D: Doodle 색연필+마카 (귀엽고 아기자기)
```
art_style: "hand-drawn doodle illustration with colored pencil and marker texture, cute and whimsical children's picture book style"
color_palette: "bright cheerful palette - warm yellows, soft pinks, fresh greens, sky blues, with playful pops of orange and lavender. paper-white background"
lighting: "flat playful lighting, no harsh shadows, hand-drawn shading with crosshatching and scribble textures"
style_suffix: "cute hand-drawn doodle illustration, colored pencil and marker texture, visible pencil strokes and marker bleed, wobbly playful outlines drawn in dark brown or black marker, off-white paper background with subtle paper grain, simple expressive cartoon faces with dot eyes and small smiles, slightly imperfect childlike charm, scribble shading, kawaii kids notebook doodle style, bright cheerful palette, flat coloring with crayon texture, no text no letters no watermark no signature"
```

**Doodle 프리셋 가이드:**
- 캐릭터는 **단순한 외형 + 큰 특징**(귀, 꼬리, 무늬)으로 표현. 사실적 비례 X
- 윤곽선이 살아 있어야 함 — "marker outline" 키워드 강조
- 배경은 종이 질감이 보이도록 — "off-white paper background"
- 너무 디테일하게 묘사하지 말 것 (doodle 본질 = 단순한 즐거움)
- 색은 평면적으로 채우되 "colored pencil texture" 로 깊이감
- 동물 캐릭터에 매우 잘 어울리는 스타일

## Object/Prop 시그니처 — 캐릭터 외 등장물의 일관성

**캐릭터만 시그니처화 하면 안 된다.** 동화에서 반복 등장하는 **사물·소품·탈것**도 동일한 외형으로 표현되어야 한다. 그렇지 않으면 "page 17에는 빨강 줄무늬 sailboat이었는데 page 19에는 갈색 rowboat가 되는" 일관성 붕괴가 발생한다.

### 어떤 사물을 시그니처화 해야 하는가
- 2개 이상의 장면에 반복 등장하는 핵심 소품 (탈것, 도구, 의상, 마법 아이템)
- 이야기의 정체성을 형성하는 사물 (예: 도토리 시계, 마법 책)
- 시각적으로 명확한 디테일을 가진 모든 사물

### 시그니처 작성 방법
캐릭터 시그니처와 똑같이, JSON 의 `prop_signatures` 또는 `object_signatures` 필드를 두고 한 문장으로 외형을 고정:

```json
"object_signatures": {
  "두두의 배": "a medium-sized doodle-style wooden sailboat with red-and-white horizontal striped hull made of visible wooden planks, a single tall central mast with a triangular sail showing red and white vertical stripes, a small red triangular pennant flag at the top of the mast, wooden oars resting on the sides, drawn with wobbly hand-drawn outlines and colored pencil texture",
  "도토리 시계": "a giant bronze acorn-shaped tower clock with a round white clock face showing roman numerals, capped with a small acorn-shape on top, body etched with simple gear patterns"
}
```

### 시그니처 강제 규칙
- 사물이 등장하는 **모든** 장면 프롬프트에 시그니처를 그대로 포함 (캐릭터 시그니처와 동일 방식)
- "rowing" 같은 행위 묘사를 추가할 때도 "rowing the same sailboat with oars" 처럼 **기존 사물 외형을 유지하는 방식**으로 작성. 동사가 사물 형태를 변형시키지 않도록.
- 시점이 다른 장면(원경/근경/뒤에서)도 같은 사물임을 강제 — "viewed from behind, the same boat as in previous scenes ..."
- 사물이 부서지거나 변형되는 경우만 예외 (그 경우엔 변형 후 새 시그니처를 정의)

### 실제 사례 — 도토리 마을 구출 작전 회고
초기 31장 생성에서 page 17~20 에 등장한 배가 5장 모두 다른 형태로 그려졌다:
- 17: 빨강흰 sailboat ✅
- 18: 노랑파랑 돛 sailboat ❌
- 19: 갈색 rowboat (돛 사라짐) ❌
- 20: 작은 노 보트 ❌

이유: "small red-striped sailboat" 만 공유 묘사, 디테일이 프롬프트마다 달라서 codex 가 자율적으로 다른 배를 생성. 해결: object_signatures 에 "두두의 배" 고정 후 18~20 재생성.

## 프롬프트 작성 템플릿

각 장면은 다음 구조로 영문 작성:

```
[Art style opening] + [Scene description] + [Character signature] + [Mood/lighting] + [Composition note] + [Style suffix]
```

예시:
```
Soft watercolor children's book illustration. A small forest clearing at dusk, fireflies gently floating above tall grass. {character_signature}. She kneels down to listen to a tiny glowing flower. Warm magical light, dreamy and quiet mood. Wide horizontal composition with generous sky area at top for text overlay. {style_suffix}
```

## 표지 프롬프트 특칙

- 주인공이 정면 또는 3/4 view 로 등장
- 제목 들어갈 빈 공간(주로 상단 또는 하단) 의도적으로 확보
- 가장 매력적이고 분위기를 압축한 한 장면

예시:
```
Soft watercolor children's book cover illustration. {character_signature} standing on a hilltop under a vast starry night sky, looking up with wonder. The composition has a large empty area at the top showing the night sky, intentionally clear of details for title text placement. Warm magical atmosphere, soft glow from stars. {style_suffix}
```

## 출력 JSON 스키마

art-director.md 의 출력 프로토콜과 동일. `_workspace/02_art_director_prompts.json`.

## 품질 체크리스트

- [ ] style_suffix 가 모든 프롬프트에 포함되어 있는가?
- [ ] character_signature 가 모든 장면 프롬프트에 그대로 들어가 있는가?
- [ ] 추상 어휘(예: "행복함", "신비로움") 가 구체 시각 단서로 바뀌었는가?
- [ ] 표지에 텍스트용 빈 공간이 명시되었는가?
- [ ] negative prompt ("no text") 가 모든 프롬프트에 있는가?
- [ ] photorealistic, dark, horror 등 그림책 부적합 키워드가 없는가?
