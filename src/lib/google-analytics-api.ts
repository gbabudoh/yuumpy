// Google Analytics API integration for fetching analytics data
export class GoogleAnalyticsAPI {
  private propertyId: string;
  private accessToken: string;

  constructor() {
    this.propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '';
    this.accessToken = process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN || '';
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!this.propertyId || !this.accessToken) {
      throw new Error('Google Analytics configuration is incomplete');
    }

    const url = new URL(`https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json' } });

      if (!response.ok) {
        throw new Error(`Google Analytics API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Analytics API request error:', error);
      throw error;
    }
  }

  // Get basic metrics
  async getBasicMetrics(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get page views
  async getPageViews(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'screenPageViews' }],
      dimensions: [{ name: 'date' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get top pages
  async getTopPages(startDate: string, endDate: string, limit: number = 10) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' }
      ],
      dimensions: [{ name: 'pagePath' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get traffic sources
  async getTrafficSources(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'bounceRate' }
      ],
      dimensions: [{ name: 'sessionSource' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get device statistics
  async getDeviceStats(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'deviceCategory' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get browser statistics
  async getBrowserStats(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'browser' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get country statistics
  async getCountryStats(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'country' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get ecommerce data
  async getEcommerceData(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalRevenue' },
        { name: 'purchaseRevenue' },
        { name: 'transactions' },
        { name: 'averagePurchaseRevenue' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get conversion goals
  async getConversionGoals(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'conversions' },
        { name: 'conversionRate' }
      ],
      dimensions: [{ name: 'eventName' }],
      orderBys: [{ metric: { metricName: 'conversions' }, desc: true }]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get real-time data
  async getRealTimeData() {
    return this.makeRequest('runRealtimeReport', {
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ]
    });
  }

  // Get user demographics
  async getUserDemographics(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'users' }],
      dimensions: [
        { name: 'age' },
        { name: 'gender' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get user interests
  async getUserInterests(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'users' }],
      dimensions: [{ name: 'interestAffinityCategory' }],
      orderBys: [{ metric: { metricName: 'users' }, desc: true }],
      limit: 10
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get search console data (if connected)
  async getSearchConsoleData(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'searchImpressions' },
        { name: 'searchClicks' },
        { name: 'searchCTR' },
        { name: 'searchPosition' }
      ],
      dimensions: [{ name: 'searchTerm' }],
      orderBys: [{ metric: { metricName: 'searchClicks' }, desc: true }],
      limit: 10
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get audience insights
  async getAudienceInsights(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'users' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' }
      ],
      dimensions: [
        { name: 'userType' },
        { name: 'sessionSource' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get content performance
  async getContentPerformance(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      dimensions: [{ name: 'pagePath' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get conversion paths
  async getConversionPaths(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'conversions' },
        { name: 'conversionRate' }
      ],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get cohort analysis
  async getCohortAnalysis(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'cohortActiveUsers' },
        { name: 'cohortTotalUsers' }
      ],
      dimensions: [
        { name: 'cohortNthWeek' },
        { name: 'cohortNthMonth' }
      ]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get funnel analysis
  async getFunnelAnalysis(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'conversions' },
        { name: 'conversionRate' }
      ],
      dimensions: [{ name: 'eventName' }],
      orderBys: [{ metric: { metricName: 'conversions' }, desc: true }]
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Get custom events
  async getCustomEvents(startDate: string, endDate: string) {
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' }
      ],
      dimensions: [{ name: 'eventName' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 20
    };

    return this.makeRequest('runReport', requestBody);
  }

  // Test API connection
  async testConnection() {
    try {
      // Check if we have the required API credentials
      if (!this.propertyId || !this.accessToken) {
        return { 
          success: false, 
          error: 'Google Analytics API credentials not configured. Please set GOOGLE_ANALYTICS_PROPERTY_ID and GOOGLE_ANALYTICS_ACCESS_TOKEN environment variables.' 
        };
      }

      // Validate property ID format (should be numeric for API v1beta)
      if (!/^\d+$/.test(this.propertyId)) {
        return {
          success: false,
          error: `Invalid Google Analytics Property ID format. You're using "${this.propertyId}" which is a tracking ID. For API access, you need the numeric Property ID from your Google Analytics account (e.g., "123456789"). The tracking ID "${this.propertyId}" is only used for frontend tracking.`
        };
      }

      // Test with a simple request
      const today = new Date().toISOString().split('T')[0];
      const result = await this.getBasicMetrics(today, today);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages
      if (errorMessage.includes('Not Found')) {
        return {
          success: false,
          error: 'Google Analytics Property ID not found. Please verify that GOOGLE_ANALYTICS_PROPERTY_ID is correct and you have access to this property.'
        };
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        return {
          success: false,
          error: 'Google Analytics API access token is invalid or expired. Please verify GOOGLE_ANALYTICS_ACCESS_TOKEN.'
        };
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
        return {
          success: false,
          error: 'Access denied to Google Analytics property. Please verify you have the correct permissions.'
        };
      }
      
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const googleAnalyticsAPI = new GoogleAnalyticsAPI();
