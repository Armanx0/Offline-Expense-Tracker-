import { offlineData } from "../src/data/offline-data";
import { useAuthStore } from "../src/store/auth.store";

jest.mock("../src/data/offline-data", () => ({
  offlineData: {
    getCurrentUser: jest.fn()
  }
}));

const mockedOfflineData = jest.mocked(offlineData);

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isHydrating: true
    });
    mockedOfflineData.getCurrentUser.mockReset();
  });

  it("hydrates a stored session", async () => {
    mockedOfflineData.getCurrentUser.mockResolvedValueOnce({
      id: "ck1234567890123456789012",
      email: "test@example.com",
      name: "Test User",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z"
    });

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().user?.email).toBe("test@example.com");
    expect(useAuthStore.getState().isHydrating).toBe(false);
  });
});
