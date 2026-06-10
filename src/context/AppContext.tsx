"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_CONSULTATIONS,
  CREATORS,
  MOCK_SEED_VERSION,
  formatDate,
  mergeConsultationsWithSeed,
} from "@/lib/mock-data";
import type {
  Answer,
  AnswerDraft,
  ApplyFormData,
  Consultation,
  Creator,
  FilterState,
  Product,
  RequestForm,
} from "@/lib/types";

type ToastState = { message: string; id: number } | null;

type AppContextValue = {
  creators: Creator[];
  consultations: Consultation[];
  bookmarks: Set<string>;
  isLoggedIn: boolean;
  applyForm: ApplyFormData;
  answerDrafts: Record<string, AnswerDraft>;
  cart: Product[];
  filter: FilterState;
  toast: ToastState;
  showToast: (message: string) => void;
  login: () => void;
  requestBookmark: (creatorId: string) => "ok" | "login_required";
  toggleBookmark: (creatorId: string) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilter: () => void;
  setApplyForm: (data: Partial<ApplyFormData>) => void;
  clearApplyForm: () => void;
  submitApplication: (form: RequestForm, creatorId: string, creatorName: string, creatorAvatar: string) => string;
  markConsultationRead: (id: string) => void;
  submitAnswer: (consultationId: string, answer: Answer) => void;
  saveAnswerDraft: (consultationId: string, draft: AnswerDraft) => void;
  getAnswerDraft: (consultationId: string) => AnswerDraft | undefined;
  addToCart: (products: Product[]) => void;
  removeFromCart: (index: number) => void;
  buyerName: string;
  buyerAvatar: string;
  submitReview: (
    consultationId: string,
    rating: {
      score: number;
      satisfaction: "positive" | "negative";
      comment?: string;
      photos?: string[];
      video?: string;
      creatorUsageAgreed?: boolean;
    },
  ) => void;
  buyerConsultations: Consultation[];
  creatorConsultations: Consultation[];
};

const DEFAULT_FILTER: FilterState = {
  sort: "consult",
  styles: [],
  spaceTypes: [],
  excludeClosed: false,
};

const STORAGE_KEY = "group9-mvp-state";

export const BUYER_NAME = "곽억배";
export const BUYER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1";

const AppContext = createContext<AppContextValue | null>(null);

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [creators, setCreators] = useState(CREATORS);
  const [consultations, setConsultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(["3"]));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applyForm, setApplyFormState] = useState<ApplyFormData>({});
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, AnswerDraft>>({});
  const [cart, setCart] = useState<Product[]>([]);
  const [filter, setFilterState] = useState<FilterState>(DEFAULT_FILTER);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.consultations?.length) {
        setConsultations(
          mergeConsultationsWithSeed(saved.consultations, saved.mockSeedVersion),
        );
      }
      if (saved.bookmarks) setBookmarks(new Set(saved.bookmarks));
      if (saved.answerDrafts) setAnswerDrafts(saved.answerDrafts);
      if (saved.cart) setCart(saved.cart);
      if (saved.filter) setFilterState(saved.filter);
      if (typeof saved.isLoggedIn === "boolean") setIsLoggedIn(saved.isLoggedIn);
      if (saved.applyForm && typeof saved.applyForm === "object") {
        setApplyFormState(saved.applyForm as ApplyFormData);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setCreators((prev) =>
      prev.map((c) => ({ ...c, bookmarked: bookmarks.has(c.id) })),
    );
  }, [bookmarks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        consultations,
        bookmarks: Array.from(bookmarks),
        answerDrafts,
        cart,
        filter,
        isLoggedIn,
        applyForm,
        mockSeedVersion: MOCK_SEED_VERSION,
      }),
    );
  }, [hydrated, consultations, bookmarks, answerDrafts, cart, filter, isLoggedIn, applyForm]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2500);
  }, []);

  const toggleBookmark = useCallback((creatorId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) next.delete(creatorId);
      else next.add(creatorId);
      return next;
    });
    setCreators((prev) =>
      prev.map((c) =>
        c.id === creatorId ? { ...c, bookmarked: !c.bookmarked } : c,
      ),
    );
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const requestBookmark = useCallback(
    (creatorId: string): "ok" | "login_required" => {
      if (!isLoggedIn) return "login_required";
      toggleBookmark(creatorId);
      return "ok";
    },
    [isLoggedIn, toggleBookmark],
  );

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), []);

  const setApplyForm = useCallback((data: Partial<ApplyFormData>) => {
    setApplyFormState((prev) => ({ ...prev, ...data }));
  }, []);

  const clearApplyForm = useCallback(() => setApplyFormState({}), []);

  const submitApplication = useCallback(
    (form: RequestForm, creatorId: string, creatorName: string, creatorAvatar: string) => {
      const id = `c${Date.now()}`;
      const consultation: Consultation = {
        id,
        creatorId,
        creatorName,
        creatorAvatar,
        buyerName: BUYER_NAME,
        buyerAvatar: BUYER_AVATAR,
        requestedAt: formatDate(),
        dDay: 3,
        status: "WAITING",
        requestForm: form,
        draftSavedAt: null,
        answer: null,
        isRead: false,
      };
      setConsultations((prev) => [consultation, ...prev]);
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId
            ? {
                ...c,
                capacity: Math.min(c.capacity + 1, c.maxCapacity),
                consultCount: c.consultCount + 1,
              }
            : c,
        ),
      );
      return id;
    },
    [],
  );

  const markConsultationRead = useCallback((id: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRead: true } : c)),
    );
  }, []);

  const submitAnswer = useCallback((consultationId: string, answer: Answer) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              status: "DONE" as const,
              answer,
              submittedAt: formatDate(),
              draftSavedAt: null,
            }
          : c,
      ),
    );
    setAnswerDrafts((prev) => {
      const next = { ...prev };
      delete next[consultationId];
      return next;
    });
  }, []);

  const saveAnswerDraft = useCallback((consultationId: string, draft: AnswerDraft) => {
    setAnswerDrafts((prev) => ({
      ...prev,
      [consultationId]: { ...draft, draftSavedAt: new Date().toISOString() },
    }));
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? { ...c, draftSavedAt: new Date().toISOString() }
          : c,
      ),
    );
  }, []);

  const getAnswerDraft = useCallback(
    (consultationId: string) => answerDrafts[consultationId],
    [answerDrafts],
  );

  const addToCart = useCallback((products: Product[]) => {
    setCart((prev) => [...prev, ...products]);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const submitReview = useCallback(
    (
      consultationId: string,
      rating: {
        score: number;
        satisfaction: "positive" | "negative";
        comment?: string;
        photos?: string[];
        video?: string;
        creatorUsageAgreed?: boolean;
      },
    ) => {
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === consultationId ? { ...c, status: "RATED", rating } : c,
        ),
      );
    },
    [],
  );

  const buyerConsultations = useMemo(
    () => consultations.filter((c) => c.buyerName === BUYER_NAME),
    [consultations],
  );

  const creatorConsultations = useMemo(
    () => consultations.filter((c) => c.creatorName === BUYER_NAME),
    [consultations],
  );

  const value: AppContextValue = {
    creators,
    consultations,
    bookmarks,
    applyForm,
    answerDrafts,
    cart,
    filter,
    toast,
    showToast,
    isLoggedIn,
    login,
    requestBookmark,
    toggleBookmark,
    setFilter,
    resetFilter,
    setApplyForm,
    clearApplyForm,
    submitApplication,
    markConsultationRead,
    submitAnswer,
    saveAnswerDraft,
    getAnswerDraft,
    addToCart,
    removeFromCart,
    submitReview,
    buyerConsultations,
    creatorConsultations,
    buyerName: BUYER_NAME,
    buyerAvatar: BUYER_AVATAR,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
