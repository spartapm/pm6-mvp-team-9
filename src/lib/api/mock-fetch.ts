const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class NetworkError extends Error {
  constructor(message = "NETWORK_ERROR") {
    super(message);
    this.name = "NetworkError";
  }
}

let homeFailOnce = false;

/** 홈 콘텐츠 로드 (네트워크 오류 시뮬레이션용) */
export async function fetchHomeContent(options?: { retry?: boolean }) {
  await delay(options?.retry ? 400 : 600);
  if (homeFailOnce) {
    homeFailOnce = false;
    throw new NetworkError();
  }
}

export function simulateHomeNetworkErrorOnNextLoad() {
  homeFailOnce = true;
}

let creatorListFailOnce = false;

/** 크리에이터 목록 로드 */
export async function fetchCreatorList(options?: { retry?: boolean }) {
  await delay(options?.retry ? 400 : 700);
  if (creatorListFailOnce) {
    creatorListFailOnce = false;
    throw new NetworkError();
  }
}

let creatorDetailFailOnce = false;

/** 크리에이터 상세 로드 */
export async function fetchCreatorDetail(options?: { retry?: boolean }) {
  await delay(options?.retry ? 400 : 600);
  if (creatorDetailFailOnce) {
    creatorDetailFailOnce = false;
    throw new NetworkError();
  }
}

export function simulateCreatorDetailNetworkErrorOnNextLoad() {
  creatorDetailFailOnce = true;
}

let eventFailOnce = false;

export async function fetchEventContent(options?: { retry?: boolean }) {
  await delay(options?.retry ? 400 : 650);
  if (eventFailOnce) {
    eventFailOnce = false;
    throw new NetworkError();
  }
}

export function simulateEventNetworkErrorOnNextLoad() {
  eventFailOnce = true;
}

let consultationsFailOnce = false;

export async function fetchConsultations(options?: { retry?: boolean }) {
  await delay(options?.retry ? 400 : 700);
  if (consultationsFailOnce) {
    consultationsFailOnce = false;
    throw new NetworkError();
  }
}

export function simulateConsultationsNetworkErrorOnNextLoad() {
  consultationsFailOnce = true;
}
