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
