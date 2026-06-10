export type ConsultationStatus = "WAITING" | "DONE" | "RATED";

export type Creator = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  consultCount: number;
  followers: string;
  tags: string[];
  styles: string[];
  spaceTypes: string[];
  capacity: number;
  maxCapacity: number;
  bookmarked?: boolean;
  isSpecial?: boolean;
  portfolio: string[];
  contentGrid: string[];
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  reason: string;
  purchaseUrl?: string;
};

export type RequestForm = {
  spaceType: string;
  spaceTypeOther?: string;
  members: { adult: number; child: number; infant: number; pet: number };
  width?: number;
  height?: number;
  roomPhotos: string[];
  ownedFurniture: string[];
  ownedFurnitureOther?: string;
  ownedFurniturePhotos: string[];
  neededFurniture: string[];
  neededFurnitureOther?: string;
  budget: string;
  style: string;
  styleOther?: string;
  requestNote?: string;
  referencePhotos: string[];
};

export type Answer = {
  comment: string;
  products: Product[];
  alternativeProducts?: Product[];
  budgetTotal: number;
  layout3dUrl?: string;
  placementTip: string;
  caution: string;
};

export type Rating = {
  score: number;
  satisfaction: "positive" | "negative";
  comment?: string;
  photos?: string[];
  video?: string;
  creatorUsageAgreed?: boolean;
};

export type Consultation = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  buyerName: string;
  buyerAvatar: string;
  requestedAt: string;
  submittedAt?: string;
  dDay: number;
  status: ConsultationStatus;
  requestForm: RequestForm;
  draftSavedAt?: string | null;
  answer?: Answer | null;
  rating?: Rating | null;
  isRead?: boolean;
};

export type ApplyFormData = Partial<RequestForm> & {
  creatorId?: string;
  creatorName?: string;
  agreed?: boolean;
};

export type FilterState = {
  sort: "consult" | "rating" | "review";
  styles: string[];
  spaceTypes: string[];
  excludeClosed: boolean;
};

export type AnswerDraft = {
  consultationId: string;
  comment: string;
  products: Array<{
    name: string;
    price: string;
    reason: string;
    purchaseUrl: string;
  }>;
  alternativeProducts: Array<{
    name: string;
    price: string;
    reason: string;
    purchaseUrl: string;
  }>;
  layout3dUrl: string;
  placementTip: string;
  caution: string;
  draftSavedAt?: string;
};
