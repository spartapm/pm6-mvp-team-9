export const BRAND = "#01a1ff";
export const ERROR = "#e03131";

export const SPACE_TYPES = [
  "원룸",
  "거실",
  "침실",
  "부엌",
  "욕실",
  "기타",
] as const;

export const BUDGET_OPTIONS = [
  "10만원 미만",
  "10만원~20만원",
  "20만원~30만원",
  "30만원~50만원",
  "50만원~100만원",
  "100만원 이상",
] as const;

export const STYLE_OPTIONS = [
  "빈티지&레트로",
  "클래식&앤틱",
  "프렌치&프로방스",
  "러블리&로맨틱",
  "인더스트리얼",
  "한국&아시아",
  "유니크&믹스매치",
  "모던",
  "미니멀&심플",
  "내추럴",
  "북유럽",
  "기타",
] as const;

export const FILTER_STYLES = STYLE_OPTIONS.filter((s) => s !== "기타");

export const FILTER_SPACE_TYPES = [
  "원룸",
  "아파트",
  "오피스텔",
  "신혼집",
  "10평 미만",
  "10평대",
  "20평대",
  "30평대",
  "거실",
  "침실",
  "부엌",
  "욕실",
  "기타",
] as const;

export const SORT_LABELS: Record<string, string> = {
  consult: "상담 많은 순",
  rating: "평점 높은 순",
  review: "리뷰 많은 순",
};

export const OWNED_FURNITURE = [
  "소파",
  "TV",
  "선반",
  "스탠드",
  "러그/카펫",
  "커튼",
  "기타",
] as const;

export const FURNITURE_BY_SPACE: Record<string, string[]> = {
  원룸: [
    "소파",
    "TV장/미디어 선반",
    "커피 테이블",
    "사이드 테이블",
    "조명(스탠드/펜던트)",
    "러그",
    "커튼/블라인드",
    "기타",
  ],
  거실: [
    "소파",
    "TV장/미디어 선반",
    "커피 테이블",
    "사이드 테이블",
    "조명(스탠드/펜던트)",
    "러그",
    "커튼/블라인드",
    "기타",
  ],
  침실: [
    "침대 프레임",
    "매트리스",
    "드레스룸",
    "옷장",
    "화장대",
    "협탁",
    "기타",
  ],
  부엌: ["식탁", "의자", "주방 수납장", "바 의자", "기타"],
  욕실: [
    "세면대",
    "거울장",
    "수납 선반",
    "캐비닛",
    "욕실 조명",
    "샤워 커튼",
    "파티션",
    "수건걸이",
    "타월 바",
    "기타",
  ],
  기타: [
    "조명(천장등·간접조명)",
    "수납장",
    "선반",
    "러그",
    "매트",
    "시계",
    "화분",
    "식물",
    "기타",
  ],
};

export const APPLY_STEPS = [
  { id: "space-type", title: "인테리어 할 공간의 종류를 선택해주세요." },
  { id: "members", title: "거주 구성원을 입력해주세요." },
  {
    id: "size",
    title: "인테리어 공간의 크기를 입력해주세요.",
    subtitle: "실제로 측정한 가로와 세로 길이를 입력해주세요.",
  },
  {
    id: "room-photos",
    title: "인테리어 공간 사진을 첨부해주세요.",
    subtitle:
      "실제 집 사진을 찍어서 올려주시면 더 정확한 견적을 받을 수 있어요 (최대 10장)",
  },
  {
    id: "owned-furniture",
    title: "보유 가구를 선택해주세요 (선택)",
    subtitle: "기존 가구를 사용하지 않으실 경우에는 선택하지 않으셔도 돼요.",
  },
  {
    id: "needed-furniture",
    title: "반드시 필요한 가구를 선택해주세요.(선택)",
  },
  { id: "budget", title: "보유 예산을 선택해주세요." },
  { id: "style", title: "원하는 인테리어 스타일을 선택해주세요." },
  { id: "request", title: "요청사항을 작성해주세요(선택)" },
] as const;

export const CAUTION_TEXT =
  "작성해주신 공간 정보와 평수를 기반으로 가구 배치 및 스타일링을 제안해드립니다. 다만, 실제 공간의 구조와 세부 치수가 모두 반영되지는 않을 수 있어 결과가 실제 공간과 일부 차이가 있을 수 있습니다. 보다 정확한 구매 전에는 실제 공간의 치수를 함께 확인해 주세요.";

export const REVIEW_POLICY_TEXT =
  "리뷰는 실제 상담 경험을 바탕으로 작성해야 하며, 허위·광고성 내용은 삭제될 수 있습니다. 타인의 개인정보, 연락처, 외부 링크는 포함할 수 없습니다. 첨부한 사진·동영상은 리뷰 노출 및 서비스 품질 개선 목적으로 활용될 수 있습니다.";

export const REVIEW_CREATOR_USAGE_TEXT =
  "[선택] 크리에이터가 제공한 견적 상담 내용을 바탕으로 작성한 리뷰, 사진, 동영상이 오늘의 집 및 크리에이터의 상담 사례, 포트폴리오, 홍보 콘텐츠로 활용될 수 있음에 동의합니다.";

export const REVIEW_POLICY_DISCLAIMER =
  "상품과 관련없는 사진이나 내용, 동일 문자 반복 등의 부적합한 내용은 삭제될 수 있습니다.";
