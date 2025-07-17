import { STYLE_GUIDE, ValidationRule } from './styleGuide';

export const validateIcon = (svg: string): ValidationRule[] => {
  const results: ValidationRule[] = [];
  
  // Check stroke width
  if (svg.includes(`stroke-width="${STYLE_GUIDE.STROKE_WIDTH}"`)) {
    results.push({ 
      rule: 'Stroke width: 2dp', 
      status: 'PASS', 
      message: 'Correct stroke width applied' 
    });
  } else {
    results.push({ 
      rule: 'Stroke width: 2dp', 
      status: 'FAIL', 
      message: 'Stroke width must be 2dp' 
    });
  }
  
  // Check viewBox
  if (svg.includes(`viewBox="0 0 ${STYLE_GUIDE.CANVAS_SIZE} ${STYLE_GUIDE.CANVAS_SIZE}"`)) {
    results.push({ 
      rule: 'Canvas size: 24x24dp', 
      status: 'PASS', 
      message: 'Correct canvas dimensions' 
    });
  } else {
    results.push({ 
      rule: 'Canvas size: 24x24dp', 
      status: 'FAIL', 
      message: 'Canvas must be 24x24dp' 
    });
  }
  
  // Check for gradients
  if (!svg.includes('gradient') && !svg.includes('fill="url(')) {
    results.push({ 
      rule: 'No gradients used', 
      status: 'PASS', 
      message: 'No gradients detected' 
    });
  } else {
    results.push({ 
      rule: 'No gradients used', 
      status: 'FAIL', 
      message: 'Gradients are not allowed' 
    });
  }
  
  // Check stroke color
  if (svg.includes(`stroke="${STYLE_GUIDE.STROKE_COLOR}"`) || svg.includes('stroke="black"')) {
    results.push({ 
      rule: 'Stroke color: black', 
      status: 'PASS', 
      message: 'Correct stroke color' 
    });
  } else {
    results.push({ 
      rule: 'Stroke color: black', 
      status: 'WARNING', 
      message: 'Stroke should be black' 
    });
  }
  
  // Check for 3D effects
  if (!svg.includes('filter') && !svg.includes('shadow') && !svg.includes('transform="matrix"')) {
    results.push({ 
      rule: 'Flat perspective only', 
      status: 'PASS', 
      message: 'No 3D effects detected' 
    });
  } else {
    results.push({ 
      rule: 'Flat perspective only', 
      status: 'WARNING', 
      message: 'Avoid 3D effects and shadows' 
    });
  }
  
  // Check live area (basic check for elements within bounds)
  const liveAreaCheck = !svg.includes('x="-') && !svg.includes('y="-') && 
                       !svg.includes('cx="-') && !svg.includes('cy="-');
  
  if (liveAreaCheck) {
    results.push({ 
      rule: 'Live area respected', 
      status: 'PASS', 
      message: 'Elements within live area bounds' 
    });
  } else {
    results.push({ 
      rule: 'Live area respected', 
      status: 'WARNING', 
      message: 'Check element positioning within live area' 
    });
  }
  
  return results;
};
