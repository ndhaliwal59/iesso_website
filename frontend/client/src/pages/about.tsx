import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Database, Cog, TrendingUp, Zap, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12">
          <Card className="p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl md:text-4xl font-semibold text-card-foreground mb-4">
              About the Model
            </h1>
            <p className="text-card-foreground leading-relaxed max-w-prose">
              Our energy demand forecasting model predicts Ontario's hourly electricity demand 
              for the next 24 hours with high accuracy. By analyzing historical consumption patterns, 
              weather conditions, and calendar features, we provide reliable forecasts that help 
              optimize energy distribution and planning.
            </p>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Data Collection</h2>
            </div>
            <p className="text-card-foreground leading-relaxed mb-4">
              Our model leverages comprehensive data sources to ensure accurate predictions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-card-foreground">
              <li>Historical IESO hourly demand data spanning multiple years</li>
              <li>Weather data including temperature, humidity, and forecasts</li>
              <li>Calendar features such as day of week, holidays, and seasonal patterns</li>
              <li>Real-time supply mix information from various energy sources</li>
            </ul>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Cog className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Data Processing</h2>
            </div>
            <p className="text-card-foreground leading-relaxed mb-4">
              Key preprocessing steps ensure data quality and model performance:
            </p>
            <ul className="list-disc list-inside space-y-2 text-card-foreground">
              <li>Handling missing values through interpolation and forward-filling techniques</li>
              <li>Feature engineering to create time-based and lag features</li>
              <li>Normalization and scaling of numerical features for optimal model training</li>
              <li>Outlier detection and treatment to improve prediction stability</li>
            </ul>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Model Training</h2>
            </div>
            <p className="text-card-foreground leading-relaxed mb-4">
              We employ advanced machine learning algorithms optimized for time-series forecasting:
            </p>
            <div className="bg-muted/30 p-6 rounded-lg mb-4">
              <p className="text-card-foreground mb-2">
                <strong>Primary Model:</strong> XGBoost Gradient Boosting
              </p>
              <p className="text-card-foreground">
                <strong>Evaluation Metrics:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-card-foreground ml-4">
                <li>Mean Absolute Error (MAE): ~150 MW</li>
                <li>Root Mean Square Error (RMSE): ~220 MW</li>
                <li>Mean Absolute Percentage Error (MAPE): ~1.2%</li>
              </ul>
            </div>
            <p className="text-card-foreground leading-relaxed">
              The model is retrained weekly with the latest data to maintain accuracy and adapt 
              to changing consumption patterns.
            </p>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Pipeline</h2>
            </div>
            <p className="text-card-foreground leading-relaxed mb-6">
              Our end-to-end forecasting pipeline operates seamlessly:
            </p>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Data Fetching', desc: 'Hourly retrieval of IESO data and weather forecasts' },
                { step: 2, title: 'Preprocessing', desc: 'Feature engineering and data normalization' },
                { step: 3, title: 'Model Inference', desc: 'Generate 24-hour demand predictions' },
                { step: 4, title: 'Validation', desc: 'Compare predictions with actual demand for accuracy tracking' },
                { step: 5, title: 'Visualization', desc: 'Real-time dashboard updates with latest forecasts' }
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-cyan-400 text-white flex items-center justify-center font-semibold">
                      {step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Future Improvements</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-card-foreground">
              <li>Enhanced renewable energy predictions with solar and wind generation forecasts</li>
              <li>Temperature-based demand refinements for extreme weather events</li>
              <li>Peak demand accuracy improvements through ensemble modeling techniques</li>
              <li>Integration of real-time grid congestion data for better load distribution</li>
              <li>Extended forecast horizon from 24 hours to 72 hours</li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
