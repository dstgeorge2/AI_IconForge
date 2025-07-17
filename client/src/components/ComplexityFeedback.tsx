import { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Lightbulb, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComplexityAnalysis {
  complexity_score: number;
  rating: 'low' | 'medium' | 'high';
  flags: string[];
  recommend_simplification: boolean;
  alternatives: Alternative[];
  feedback: ComplexityFeedback[];
}

interface Alternative {
  type: string;
  title: string;
  description: string;
  action: string;
  confidence: number;
}

interface ComplexityFeedback {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

interface ComplexityFeedbackProps {
  analysis: ComplexityAnalysis;
  onRefine: (type: string, feedback: string) => void;
  isRefining: boolean;
}

export default function ComplexityFeedback({ analysis, onRefine, isRefining }: ComplexityFeedbackProps) {
  const [customFeedback, setCustomFeedback] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { toast } = useToast();

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleAlternativeClick = (alternative: Alternative) => {
    let feedback = '';
    
    switch (alternative.type) {
      case 'simplified':
        feedback = 'Make it simpler and less busy';
        break;
      case 'material_style':
        feedback = 'Use Google Material Design style';
        break;
      case 'carbon_style':
        feedback = 'Use IBM Carbon Design style';
        break;
      default:
        feedback = alternative.description;
    }
    
    onRefine(alternative.type, feedback);
  };

  const handleCustomFeedback = () => {
    if (customFeedback.trim()) {
      onRefine('general', customFeedback);
      setCustomFeedback('');
      setShowCustomInput(false);
    } else {
      toast({ title: "Please enter your feedback", variant: "destructive" });
    }
  };

  if (analysis.rating === 'low' && analysis.flags.length === 0) {
    return (
      <div className="brutal-container">
        <div className="brutal-header">
          <h3 className="font-bold text-sm uppercase flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            QUALITY ANALYSIS
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">ICON COMPLEXITY: OPTIMAL</span>
          </div>
          <p className="text-xs mt-2 text-gray-600">
            This icon meets all quality standards for UI use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="brutal-container">
      <div className="brutal-header">
        <h3 className="font-bold text-sm uppercase flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          COMPLEXITY ANALYSIS
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Complexity Score */}
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 border border-black ${getRatingColor(analysis.rating)} flex items-center gap-1`}>
            {getRatingIcon(analysis.rating)}
            <span className="text-xs font-bold uppercase">{analysis.rating} COMPLEXITY</span>
          </div>
          <span className="text-xs text-gray-600">
            Score: {Math.round(analysis.complexity_score * 100)}%
          </span>
        </div>

        {/* Feedback Messages */}
        {analysis.feedback.length > 0 && (
          <div className="space-y-2">
            {analysis.feedback.map((feedback, index) => (
              <div 
                key={index} 
                className={`p-2 border text-xs ${
                  feedback.severity === 'error' ? 'border-red-500 bg-red-50 text-red-700' :
                  feedback.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                  'border-blue-500 bg-blue-50 text-blue-700'
                }`}
              >
                {feedback.message}
              </div>
            ))}
          </div>
        )}

        {/* Complexity Flags */}
        {analysis.flags.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase">Issues Found:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {analysis.flags.map((flag, index) => (
                <li key={index} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives */}
        {analysis.alternatives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase">Suggested Improvements:</h4>
            <div className="space-y-2">
              {analysis.alternatives.map((alternative, index) => (
                <button
                  key={index}
                  onClick={() => handleAlternativeClick(alternative)}
                  disabled={isRefining}
                  className="w-full p-2 border border-black hover:bg-gray-50 text-left text-xs disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{alternative.title}</div>
                      <div className="text-gray-600">{alternative.description}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {Math.round(alternative.confidence * 100)}%
                      </span>
                      {isRefining ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wrench className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Feedback */}
        <div className="border-t border-gray-200 pt-3">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="brutal-button w-full text-xs"
              disabled={isRefining}
            >
              PROVIDE CUSTOM FEEDBACK
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                placeholder="E.g., 'Make it less busy', 'Use a circle instead of square', 'Move the plus to bottom right'"
                className="w-full h-16 border border-black p-2 text-xs resize-none"
                disabled={isRefining}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCustomFeedback}
                  disabled={isRefining || !customFeedback.trim()}
                  className="brutal-button flex-1 text-xs"
                >
                  {isRefining ? (
                    <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                  ) : (
                    'APPLY FEEDBACK'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomFeedback('');
                  }}
                  className="brutal-button bg-gray-100 text-xs"
                  disabled={isRefining}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}