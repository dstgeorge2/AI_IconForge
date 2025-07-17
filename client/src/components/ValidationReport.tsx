import { ValidationRule } from '@/lib/styleGuide';

interface ValidationReportProps {
  validationResults: ValidationRule[];
}

export default function ValidationReport({ validationResults }: ValidationReportProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'text-green-600';
      case 'FAIL':
        return 'text-red-600';
      case 'WARNING':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">Validation Report</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 text-xs">
          {validationResults.length > 0 ? (
            validationResults.map((result, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="font-mono">{result.rule}</span>
                <span className={`font-bold ${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 font-mono">
              AWAITING ICON GENERATION...
            </div>
          )}
        </div>
        
        {validationResults.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-300">
            <div className="text-xs text-gray-600">
              {validationResults.filter(r => r.status === 'PASS').length} passes, {' '}
              {validationResults.filter(r => r.status === 'FAIL').length} failures, {' '}
              {validationResults.filter(r => r.status === 'WARNING').length} warnings
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
