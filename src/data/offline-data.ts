import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths
} from "date-fns";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import {
  categorySchema,
  createCategoryRequestSchema,
  createExpenseRequestSchema,
  listExpensesQuerySchema,
  updateCategoryRequestSchema,
  updateExpenseRequestSchema,
  userSchema,
  type CategoryDto,
  type CreateCategoryRequest,
  type CreateExpenseRequest,
  type DashboardOverview,
  type ExpenseDto,
  type ListExpensesQuery,
  type PaginatedResponse,
  type Period,
  type UpdateCategoryRequest,
  type UpdateExpenseRequest,
  type UserDto
} from "../contracts";
import { z } from "zod";

const DATABASE_VERSION = 1;
const DEFAULT_PROFILE_NAME = "Local Wallet";
const DEFAULT_PROFILE_EMAIL = "offline@expense-tracker.local";
const DEFAULT_PROFILE_CURRENCY = "INR";
const DEFAULT_PROFILE_TIMEZONE = "Asia/Kolkata";
const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "\uD83C\uDF5C", color: "#EF4444" },
  { name: "Transport", icon: "\uD83D\uDE95", color: "#F97316" },
  { name: "Shopping", icon: "\uD83D\uDECD\uFE0F", color: "#8B5CF6" },
  { name: "Bills", icon: "\uD83D\uDCA1", color: "#3B82F6" },
  { name: "Health", icon: "\uD83E\uDE7A", color: "#10B981" },
  { name: "Entertainment", icon: "\uD83C\uDFAC", color: "#EC4899" },
  { name: "Other", icon: "\uD83D\uDCE6", color: "#64748B" }
] as const;

const offlineExpenseRecordSchema = z.object({
  id: z.string().cuid(),
  amountMinor: z.number().int().positive(),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  description: z.string().nullable(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  categoryId: z.string().cuid()
});

const offlineDatabaseSchema = z.object({
  version: z.literal(DATABASE_VERSION),
  user: userSchema,
  categories: z.array(categorySchema),
  expenses: z.array(offlineExpenseRecordSchema)
});

type OfflineExpenseRecord = z.infer<typeof offlineExpenseRecordSchema>;
type OfflineDatabase = z.infer<typeof offlineDatabaseSchema>;

export class OfflineDataError extends Error {
  constructor(
    message: string,
    public readonly code = "INTERNAL_ERROR",
    public readonly status = 500
  ) {
    super(message);
    this.name = "OfflineDataError";
  }
}

export interface ExportResult {
  uri: string;
  savedExternally: boolean;
}

let databaseCache: OfflineDatabase | null = null;
let databasePromise: Promise<OfflineDatabase> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

const getAppDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new OfflineDataError("Local storage is unavailable on this device");
  }

  return `${FileSystem.documentDirectory}expense-tracker/`;
};

const getDatabasePath = () => `${getAppDirectory()}database.json`;
const getExportsDirectory = () => `${getAppDirectory()}exports/`;

const ensureDirectory = async (path: string) => {
  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
};

const createCuid = () => {
  const timestamp = Date.now().toString(36).padStart(8, "0").slice(-8);
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");

  return `c${timestamp}${random}`;
};

const nowIso = () => new Date().toISOString();

const createDefaultUser = (): UserDto => {
  const timestamp = nowIso();

  return {
    id: createCuid(),
    email: DEFAULT_PROFILE_EMAIL,
    name: DEFAULT_PROFILE_NAME,
    currencyCode: DEFAULT_PROFILE_CURRENCY,
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      DEFAULT_PROFILE_TIMEZONE,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

const createInitialDatabase = (): OfflineDatabase => {
  const timestamp = nowIso();

  return {
    version: DATABASE_VERSION,
    user: createDefaultUser(),
    categories: DEFAULT_CATEGORIES.map((category) => ({
      id: createCuid(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      createdAt: timestamp,
      updatedAt: timestamp
    })),
    expenses: []
  };
};

const persistDatabase = async (database: OfflineDatabase) => {
  databaseCache = database;
  await ensureDirectory(getAppDirectory());

  writeQueue = writeQueue.then(() =>
    FileSystem.writeAsStringAsync(getDatabasePath(), JSON.stringify(database))
  );

  await writeQueue;
};

const loadDatabase = async (): Promise<OfflineDatabase> => {
  if (databaseCache) {
    return databaseCache;
  }

  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = (async () => {
    await ensureDirectory(getAppDirectory());
    const databasePath = getDatabasePath();
    const info = await FileSystem.getInfoAsync(databasePath);

    if (!info.exists) {
      const initialDatabase = createInitialDatabase();
      await persistDatabase(initialDatabase);
      return initialDatabase;
    }

    try {
      const rawValue = await FileSystem.readAsStringAsync(databasePath);
      const parsedValue = offlineDatabaseSchema.parse(JSON.parse(rawValue));
      databaseCache = parsedValue;
      return parsedValue;
    } catch {
      const initialDatabase = createInitialDatabase();
      await persistDatabase(initialDatabase);
      return initialDatabase;
    }
  })();

  try {
    return await databasePromise;
  } finally {
    databasePromise = null;
  }
};

const normalizeDescription = (description?: string) => {
  const trimmed = description?.trim();
  return trimmed?.length ? trimmed : null;
};

const normalizeIcon = (icon?: string) => {
  const trimmed = icon?.trim();
  return trimmed?.length ? trimmed : null;
};

const normalizeColor = (color?: string) => {
  const trimmed = color?.trim();
  return trimmed?.length ? trimmed : null;
};

const ensureCategoryExists = (
  categories: CategoryDto[],
  categoryId: string
) => {
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new OfflineDataError(
      "The selected category is invalid",
      "EXPENSE_INVALID_CATEGORY",
      400
    );
  }

  return category;
};

const ensureUniqueCategoryName = (
  categories: CategoryDto[],
  name: string,
  currentCategoryId?: string
) => {
  const duplicate = categories.find(
    (category) => category.name === name && category.id !== currentCategoryId
  );

  if (duplicate) {
    throw new OfflineDataError(
      "A category with this name already exists",
      "CATEGORY_NAME_TAKEN",
      409
    );
  }
};

const serializeExpense = (
  expense: OfflineExpenseRecord,
  categories: CategoryDto[]
): ExpenseDto => ({
  id: expense.id,
  amountMinor: expense.amountMinor,
  currencyCode: expense.currencyCode,
  description: expense.description,
  occurredAt: expense.occurredAt,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
  category: ensureCategoryExists(categories, expense.categoryId)
});

const sortExpenseRecords = (
  expenses: OfflineExpenseRecord[],
  sort: ListExpensesQuery["sort"]
) =>
  [...expenses].sort((left, right) => {
    switch (sort) {
      case "amount_asc":
        return left.amountMinor - right.amountMinor;
      case "amount_desc":
        return right.amountMinor - left.amountMinor;
      case "occurredAt_asc":
        return (
          new Date(left.occurredAt).getTime() -
          new Date(right.occurredAt).getTime()
        );
      case "occurredAt_desc":
      default:
        return (
          new Date(right.occurredAt).getTime() -
          new Date(left.occurredAt).getTime()
        );
    }
  });

const matchesQuery = (
  expense: OfflineExpenseRecord,
  query: ListExpensesQuery
) => {
  const occurredAt = new Date(expense.occurredAt).getTime();

  if (query.from && occurredAt < new Date(query.from).getTime()) {
    return false;
  }

  if (query.to && occurredAt > new Date(query.to).getTime()) {
    return false;
  }

  if (query.categoryId && expense.categoryId !== query.categoryId) {
    return false;
  }

  if (query.search) {
    const haystack = expense.description?.toLowerCase() ?? "";

    if (!haystack.includes(query.search.toLowerCase())) {
      return false;
    }
  }

  return true;
};

const getPeriodDateRange = (period: Period, referenceDate = new Date()) => {
  const end = endOfDay(referenceDate);

  if (period === "all") {
    return {
      from: undefined,
      to: end
    };
  }

  const start =
    period === "week"
      ? startOfDay(subDays(referenceDate, 6))
      : period === "month"
        ? startOfMonth(referenceDate)
        : startOfYear(referenceDate);

  return {
    from: start,
    to: end
  };
};

const getTimelineDates = (period: Period, referenceDate = new Date()) => {
  if (period === "year") {
    return eachMonthOfInterval({
      start: startOfYear(referenceDate),
      end: startOfMonth(referenceDate)
    });
  }

  if (period === "all") {
    return eachMonthOfInterval({
      start: startOfMonth(subMonths(referenceDate, 11)),
      end: startOfMonth(referenceDate)
    });
  }

  const start =
    period === "week"
      ? startOfDay(subDays(referenceDate, 6))
      : startOfMonth(referenceDate);

  return eachDayOfInterval({
    start,
    end: startOfDay(referenceDate)
  });
};

const getTimelineBucketKey = (value: Date | string, period: Period) =>
  format(
    new Date(value),
    period === "week" || period === "month" ? "yyyy-MM-dd" : "yyyy-MM"
  );

const getTimelineLabel = (value: Date, period: Period) =>
  format(
    value,
    period === "week" ? "EEE" : period === "month" ? "MMM d" : "MMM"
  );

const buildTimeline = (
  expenses: OfflineExpenseRecord[],
  period: Period
): DashboardOverview["timeline"] => {
  const dates = getTimelineDates(period);
  const totals = new Map<string, number>();

  for (const expense of expenses) {
    const key = getTimelineBucketKey(expense.occurredAt, period);
    totals.set(key, (totals.get(key) ?? 0) + expense.amountMinor);
  }

  return dates.map((date) => {
    const key = getTimelineBucketKey(date, period);

    return {
      label: getTimelineLabel(date, period),
      date: startOfDay(date).toISOString(),
      amountMinor: totals.get(key) ?? 0
    };
  });
};

const escapeCsvValue = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
};

const createExportFile = async (
  fileName: string,
  mimeType: string,
  contents: string
): Promise<ExportResult> => {
  if (Platform.OS === "android") {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const exportUri =
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            mimeType
          );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          exportUri,
          contents
        );

        return {
          uri: exportUri,
          savedExternally: true
        };
      }
    } catch {
      // Fall through to the app's local export directory.
    }
  }

  const exportDirectory = getExportsDirectory();
  await ensureDirectory(exportDirectory);
  const fileUri = `${exportDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, contents);

  return {
    uri: fileUri,
    savedExternally: false
  };
};

export const offlineData = {
  getCurrentUser: async () => {
    const database = await loadDatabase();
    return database.user;
  },

  getCategories: async () => {
    const database = await loadDatabase();
    return [...database.categories].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  },

  createCategory: async (payload: CreateCategoryRequest) => {
    const input = createCategoryRequestSchema.parse(payload);
    const database = await loadDatabase();
    ensureUniqueCategoryName(database.categories, input.name);
    const timestamp = nowIso();

    const category: CategoryDto = {
      id: createCuid(),
      name: input.name,
      icon: normalizeIcon(input.icon),
      color: normalizeColor(input.color),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    database.categories = [...database.categories, category];
    await persistDatabase(database);
    return category;
  },

  updateCategory: async (id: string, payload: UpdateCategoryRequest) => {
    const input = updateCategoryRequestSchema.parse(payload);
    const database = await loadDatabase();
    const categoryIndex = database.categories.findIndex(
      (category) => category.id === id
    );

    if (categoryIndex < 0) {
      throw new OfflineDataError(
        "Category not found",
        "RESOURCE_NOT_FOUND",
        404
      );
    }

    const existingCategory = database.categories[categoryIndex]!;
    const nextName = input.name ?? existingCategory.name;
    ensureUniqueCategoryName(database.categories, nextName, id);

    const updatedCategory: CategoryDto = {
      id: existingCategory.id,
      name: input.name ?? existingCategory.name,
      icon:
        input.icon !== undefined
          ? normalizeIcon(input.icon)
          : existingCategory.icon,
      color:
        input.color !== undefined
          ? normalizeColor(input.color)
          : existingCategory.color,
      createdAt: existingCategory.createdAt,
      updatedAt: nowIso()
    };

    database.categories = database.categories.map((category) =>
      category.id === id ? updatedCategory : category
    );
    await persistDatabase(database);
    return updatedCategory;
  },

  deleteCategory: async (id: string) => {
    const database = await loadDatabase();
    const category = database.categories.find((item) => item.id === id);

    if (!category) {
      throw new OfflineDataError(
        "Category not found",
        "RESOURCE_NOT_FOUND",
        404
      );
    }

    if (database.expenses.some((expense) => expense.categoryId === id)) {
      throw new OfflineDataError(
        "Delete or move expenses before removing this category",
        "CATEGORY_HAS_EXPENSES",
        409
      );
    }

    database.categories = database.categories.filter((item) => item.id !== id);
    await persistDatabase(database);

    return { ok: true as const };
  },

  getExpenses: async (
    query: ListExpensesQuery
  ): Promise<PaginatedResponse<{ items: ExpenseDto[] }>> => {
    const parsedQuery = listExpensesQuerySchema.parse(query);
    const database = await loadDatabase();
    const filteredExpenses = sortExpenseRecords(
      database.expenses.filter((expense) => matchesQuery(expense, parsedQuery)),
      parsedQuery.sort
    );
    const startIndex = (parsedQuery.page - 1) * parsedQuery.pageSize;
    const endIndex = startIndex + parsedQuery.pageSize;
    const pagedExpenses = filteredExpenses
      .slice(startIndex, endIndex)
      .map((expense) => serializeExpense(expense, database.categories));

    return {
      success: true,
      data: {
        items: pagedExpenses
      },
      meta: {
        page: parsedQuery.page,
        pageSize: parsedQuery.pageSize,
        total: filteredExpenses.length,
        pageCount: Math.ceil(filteredExpenses.length / parsedQuery.pageSize)
      }
    };
  },

  getExpense: async (id: string) => {
    const database = await loadDatabase();
    const expense = database.expenses.find((item) => item.id === id);

    if (!expense) {
      throw new OfflineDataError(
        "Expense not found",
        "RESOURCE_NOT_FOUND",
        404
      );
    }

    return serializeExpense(expense, database.categories);
  },

  createExpense: async (payload: CreateExpenseRequest) => {
    const input = createExpenseRequestSchema.parse(payload);
    const database = await loadDatabase();
    ensureCategoryExists(database.categories, input.categoryId);
    const timestamp = nowIso();

    const expense: OfflineExpenseRecord = {
      id: createCuid(),
      amountMinor: input.amountMinor,
      currencyCode: input.currencyCode,
      description: normalizeDescription(input.description),
      occurredAt: input.occurredAt ?? timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      categoryId: input.categoryId
    };

    database.expenses = [...database.expenses, expense];
    await persistDatabase(database);
    return serializeExpense(expense, database.categories);
  },

  updateExpense: async (id: string, payload: UpdateExpenseRequest) => {
    const input = updateExpenseRequestSchema.parse(payload);
    const database = await loadDatabase();
    const expenseIndex = database.expenses.findIndex(
      (expense) => expense.id === id
    );

    if (expenseIndex < 0) {
      throw new OfflineDataError(
        "Expense not found",
        "RESOURCE_NOT_FOUND",
        404
      );
    }

    if (input.categoryId) {
      ensureCategoryExists(database.categories, input.categoryId);
    }

    const existingExpense = database.expenses[expenseIndex]!;
    const updatedExpense: OfflineExpenseRecord = {
      id: existingExpense.id,
      amountMinor: input.amountMinor ?? existingExpense.amountMinor,
      currencyCode: input.currencyCode ?? existingExpense.currencyCode,
      description:
        input.description !== undefined
          ? normalizeDescription(input.description)
          : existingExpense.description,
      occurredAt: input.occurredAt ?? existingExpense.occurredAt,
      createdAt: existingExpense.createdAt,
      updatedAt: nowIso(),
      categoryId: input.categoryId ?? existingExpense.categoryId
    };

    database.expenses = database.expenses.map((expense) =>
      expense.id === id ? updatedExpense : expense
    );
    await persistDatabase(database);
    return serializeExpense(updatedExpense, database.categories);
  },

  deleteExpense: async (id: string) => {
    const database = await loadDatabase();
    const expenseExists = database.expenses.some(
      (expense) => expense.id === id
    );

    if (!expenseExists) {
      throw new OfflineDataError(
        "Expense not found",
        "RESOURCE_NOT_FOUND",
        404
      );
    }

    database.expenses = database.expenses.filter(
      (expense) => expense.id !== id
    );
    await persistDatabase(database);

    return { ok: true as const };
  },

  getDashboardOverview: async (period: Period): Promise<DashboardOverview> => {
    const database = await loadDatabase();
    const range = getPeriodDateRange(period);
    const filteredExpenses = sortExpenseRecords(
      database.expenses.filter((expense) => {
        const occurredAt = new Date(expense.occurredAt).getTime();

        if (range.from && occurredAt < range.from.getTime()) {
          return false;
        }

        return occurredAt <= range.to.getTime();
      }),
      "occurredAt_desc"
    );

    const totalAmountMinor = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amountMinor,
      0
    );
    const transactionCount = filteredExpenses.length;
    const averageAmountMinor =
      transactionCount === 0
        ? 0
        : Math.round(totalAmountMinor / transactionCount);
    const categoryTotals = new Map<
      string,
      {
        amountMinor: number;
        count: number;
      }
    >();

    for (const expense of filteredExpenses) {
      const existingTotals = categoryTotals.get(expense.categoryId);

      if (existingTotals) {
        existingTotals.amountMinor += expense.amountMinor;
        existingTotals.count += 1;
        continue;
      }

      categoryTotals.set(expense.categoryId, {
        amountMinor: expense.amountMinor,
        count: 1
      });
    }

    const topCategories = Array.from(categoryTotals.entries())
      .map(([categoryId, totals]) => ({
        category: ensureCategoryExists(database.categories, categoryId),
        amountMinor: totals.amountMinor,
        percentage:
          totalAmountMinor === 0
            ? 0
            : Number(
                ((totals.amountMinor / totalAmountMinor) * 100).toFixed(2)
              ),
        count: totals.count
      }))
      .sort((left, right) => right.amountMinor - left.amountMinor)
      .slice(0, 5);

    return {
      summary: {
        totalAmountMinor,
        transactionCount,
        averageAmountMinor,
        currencyCode: database.user.currencyCode
      },
      topCategories,
      timeline: buildTimeline(filteredExpenses, period),
      recentExpenses: filteredExpenses
        .slice(0, 5)
        .map((expense) => serializeExpense(expense, database.categories))
    };
  },

  exportExpensesCsv: async () => {
    const database = await loadDatabase();
    const rows = sortExpenseRecords(database.expenses, "occurredAt_desc").map(
      (expense) => {
        const category = ensureCategoryExists(
          database.categories,
          expense.categoryId
        );

        return [
          format(new Date(expense.occurredAt), "yyyy-MM-dd"),
          (expense.amountMinor / 100).toFixed(2),
          expense.currencyCode,
          category.name,
          expense.description ?? ""
        ]
          .map((value) => escapeCsvValue(value))
          .join(",");
      }
    );
    const contents = [
      "Date,Amount,Currency,Category,Description",
      ...rows
    ].join("\n");
    const fileName = `expenses-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;

    return createExportFile(fileName, "text/csv", contents);
  },

  exportBackupFile: async () => {
    const database = await loadDatabase();
    const contents = JSON.stringify(
      {
        version: DATABASE_VERSION,
        exportedAt: nowIso(),
        user: database.user,
        categories: database.categories,
        expenses: sortExpenseRecords(database.expenses, "occurredAt_desc").map(
          (expense) => serializeExpense(expense, database.categories)
        )
      },
      null,
      2
    );
    const fileName = `expense-tracker-backup-${format(new Date(), "yyyyMMdd-HHmmss")}.json`;

    return createExportFile(fileName, "application/json", contents);
  }
};
