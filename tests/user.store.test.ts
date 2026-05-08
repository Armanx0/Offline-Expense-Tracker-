import { offlineData } from "../src/data/offline-data";
import { useUserStore } from "../src/store/user.store";

jest.mock("../src/data/offline-data", () => ({
  offlineData: {
    getCurrentUser: jest.fn()
  }
}));

const mockedOfflineData = jest.mocked(offlineData);

describe("user store", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isHydrating: true
    });
    mockedOfflineData.getCurrentUser.mockReset();
  });

  it("hydrates the stored offline profile", async () => {
    mockedOfflineData.getCurrentUser.mockResolvedValueOnce({
      id: "ck1234567890123456789012",
      email: "test@example.com",
      name: "Test User",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z"
    });

    await useUserStore.getState().hydrate();

    expect(useUserStore.getState().user?.email).toBe("test@example.com");
    expect(useUserStore.getState().isHydrating).toBe(false);
  });
});
