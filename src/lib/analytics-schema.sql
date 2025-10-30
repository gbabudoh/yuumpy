-- Analytics Settings Table
CREATE TABLE IF NOT EXISTS analytics_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_analytics_enabled BOOLEAN DEFAULT FALSE,
  google_analytics_tracking_id VARCHAR(50),
  google_analytics_property_id VARCHAR(50),
  google_analytics_access_token TEXT,
  matomo_enabled BOOLEAN DEFAULT FALSE,
  matomo_url VARCHAR(255),
  matomo_site_id VARCHAR(50),
  custom_events_config JSON,
  privacy_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT IGNORE INTO analytics_settings (id, google_analytics_enabled, matomo_enabled, custom_events_config, privacy_settings) 
VALUES (1, FALSE, FALSE, 
  JSON_OBJECT(
    'productViews', true,
    'bannerClicks', true,
    'emailSignups', true,
    'purchases', true
  ),
  JSON_OBJECT(
    'anonymizeIP', true,
    'respectDoNotTrack', true,
    'cookieConsent', true
  )
);
