// Matomo API integration for fetching analytics data
export class MatomoAPI {
  private baseUrl: string;
  private siteId: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MATOMO_URL || '';
    this.siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '';
    this.apiToken = process.env.MATOMO_API_TOKEN || '';
  }

  private async makeRequest(method: string, params: Record<string, any> = {}) {
    if (!this.baseUrl || !this.siteId || !this.apiToken) {
      throw new Error('Matomo configuration is incomplete');
    }

    const url = new URL(`${this.baseUrl}/index.php`);
    url.searchParams.set('module', 'API');
    url.searchParams.set('format', 'JSON');
    url.searchParams.set('idSite', this.siteId);
    url.searchParams.set('token_auth', this.apiToken);
    url.searchParams.set('method', method);

    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Matomo API request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Matomo API request error:', error);
      throw error;
    }
  }

  // Get site overview statistics
  async getSiteOverview(period: string = 'day', date: string = 'today') {
    return this.makeRequest('VisitsSummary.get', {
      period,
      date
    });
  }

  // Get visitor statistics
  async getVisitorStats(period: string = 'day', date: string = 'today') {
    return this.makeRequest('VisitsSummary.getVisits', {
      period,
      date
    });
  }

  // Get page views
  async getPageViews(period: string = 'day', date: string = 'today') {
    return this.makeRequest('VisitsSummary.getActions', {
      period,
      date
    });
  }

  // Get top pages
  async getTopPages(period: string = 'day', date: string = 'today', limit: number = 10) {
    return this.makeRequest('Actions.getPageUrls', {
      period,
      date,
      filter_limit: limit
    });
  }

  // Get referrer statistics
  async getReferrers(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Referrers.getReferrerType', {
      period,
      date
    });
  }

  // Get device statistics
  async getDeviceStats(period: string = 'day', date: string = 'today') {
    return this.makeRequest('DevicesDetection.getType', {
      period,
      date
    });
  }

  // Get browser statistics
  async getBrowserStats(period: string = 'day', date: string = 'today') {
    return this.makeRequest('DevicesDetection.getBrowsers', {
      period,
      date
    });
  }

  // Get country statistics
  async getCountryStats(period: string = 'day', date: string = 'today') {
    return this.makeRequest('UserCountry.getCountry', {
      period,
      date
    });
  }

  // Get goal conversions
  async getGoalConversions(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Goals.get', {
      period,
      date
    });
  }

  // Get ecommerce statistics
  async getEcommerceStats(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Goals.get', {
      period,
      date,
      idGoal: 'ecommerceOrder'
    });
  }

  // Get real-time visitor data
  async getRealTimeVisitors() {
    return this.makeRequest('Live.getLastVisitsDetails', {
      period: 'range',
      date: 'today',
      filter_limit: 10
    });
  }

  // Get custom events
  async getCustomEvents(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Events.getCategory', {
      period,
      date
    });
  }

  // Get site search statistics
  async getSiteSearch(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Actions.getSiteSearchKeywords', {
      period,
      date
    });
  }

  // Get conversion funnels
  async getConversionFunnels(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Goals.get', {
      period,
      date
    });
  }

  // Get visitor flow
  async getVisitorFlow(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Actions.getPageUrls', {
      period,
      date,
      expanded: 1
    });
  }

  // Get custom dimensions (if configured)
  async getCustomDimensions(period: string = 'day', date: string = 'today') {
    return this.makeRequest('CustomDimensions.getCustomDimension', {
      period,
      date
    });
  }

  // Get A/B test results (if configured)
  async getABTestResults(period: string = 'day', date: string = 'today') {
    return this.makeRequest('AbTesting.getExperiment', {
      period,
      date
    });
  }

  // Get heatmap data (if configured)
  async getHeatmapData(period: string = 'day', date: string = 'today') {
    return this.makeRequest('HeatmapSessionRecording.getSessions', {
      period,
      date
    });
  }

  // Get form analytics (if configured)
  async getFormAnalytics(period: string = 'day', date: string = 'today') {
    return this.makeRequest('FormAnalytics.getForm', {
      period,
      date
    });
  }

  // Get media analytics (if configured)
  async getMediaAnalytics(period: string = 'day', date: string = 'today') {
    return this.makeRequest('MediaAnalytics.getMedia', {
      period,
      date
    });
  }

  // Get cohort analysis
  async getCohortAnalysis(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Cohorts.getCohorts', {
      period,
      date
    });
  }

  // Get user flow
  async getUserFlow(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Actions.getPageUrls', {
      period,
      date,
      expanded: 1
    });
  }

  // Get performance metrics
  async getPerformanceMetrics(period: string = 'day', date: string = 'today') {
    return this.makeRequest('Actions.getPageUrls', {
      period,
      date,
      expanded: 1
    });
  }

  // Get custom reports
  async getCustomReports(period: string = 'day', date: string = 'today') {
    return this.makeRequest('CustomReports.getCustomReports', {
      period,
      date
    });
  }

  // Get segment data
  async getSegmentData(segment: string, period: string = 'day', date: string = 'today') {
    return this.makeRequest('API.get', {
      period,
      date,
      segment
    });
  }

  // Get multi-site data (if applicable)
  async getMultiSiteData(period: string = 'day', date: string = 'today') {
    return this.makeRequest('SitesManager.getSitesFromGroup', {
      period,
      date
    });
  }

  // Get user management data
  async getUserManagementData(period: string = 'day', date: string = 'today') {
    return this.makeRequest('UsersManager.getUsers', {
      period,
      date
    });
  }

  // Get plugin data
  async getPluginData(period: string = 'day', date: string = 'today') {
    return this.makeRequest('API.getPluginNames', {
      period,
      date
    });
  }

  // Get system information
  async getSystemInfo() {
    return this.makeRequest('API.getSystemInformation');
  }

  // Get API information
  async getAPIInfo() {
    return this.makeRequest('API.getAPIInformation');
  }

  // Test API connection
  async testConnection() {
    try {
      const result = await this.getSiteOverview('day', 'today');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const matomoAPI = new MatomoAPI();
