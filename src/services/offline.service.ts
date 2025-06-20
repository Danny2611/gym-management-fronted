export class OfflineService {
  private static handleOfflineResponse(response: any) {
    if (response && response.offline) {
      return {
        success: false,
        message: response.message,
        offline: true
      };
    }
    return response;
  }

  static async wrappedFetch(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return this.handleOfflineResponse(data);
    } catch (error) {
      // Nếu offline, service worker sẽ trả về cached data
      throw error;
    }
  }
}// # Quản lý dữ liệu offline
