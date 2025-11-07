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
            <p className="text-card-foreground leading-relaxed">
              I used publicly available energy demand data from the IESO data repository to train a Temporal Fusion Transformer (TFT) model, which is well-suited for time-series forecasting. The dashboard is automated using AWS, where the model is retrained regularly and new data is collected through lambda. Forecasts are then updated every day providing an up-to-date predictions of Ontario's electricity demand.
            </p>
          </Card>

          <Card className="p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-card-foreground">Model Training</h2>
            </div>
            <p className="text-card-foreground leading-relaxed mb-4">
              View the <a href="https://www.kaggle.com/code/nishandhaliwal06/leso-baseline" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">training notebook</a> for details on the model training process.
            </p>
            <div className="bg-muted/30 p-6 rounded-lg mb-4">
              <p className="text-card-foreground mb-2">
                <strong>Primary Model:</strong> Temporal Fusion Transformer (TFT)
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
                { step: 1, title: 'Data Fetching', desc: 'Hourly retrieval of IESO data using lambda' },
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
              <li>Inclusion of weather forecasts and zone-specific demand data to refine local forecasting</li>
              <li>Improved peak demand accuracy using a dedicated peak-demand forecasting model</li>
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
