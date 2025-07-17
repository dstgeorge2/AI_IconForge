/**
 * METAPHOR ENGINE
 * Generates multiple metaphor variants and resolves synonyms for better icon generation
 */

export interface MetaphorVariant {
  concept: string;
  metaphor: string;
  confidence: number;
  category: string;
  visualElements: string[];
}

export interface MetaphorContext {
  textDescription?: string;
  fileName?: string;
  detectedAction?: string;
  detectedObject?: string;
  category?: string;
}

// Metaphor synonym mappings
const METAPHOR_SYNONYMS = {
  'add': ['plus', 'create', 'new', 'insert', 'append'],
  'delete': ['remove', 'trash', 'bin', 'erase', 'clear'],
  'edit': ['modify', 'change', 'update', 'revise', 'adjust'],
  'save': ['store', 'keep', 'preserve', 'write', 'commit'],
  'user': ['person', 'profile', 'account', 'member', 'individual'],
  'folder': ['directory', 'container', 'collection', 'group'],
  'file': ['document', 'page', 'item', 'record'],
  'settings': ['preferences', 'config', 'options', 'controls'],
  'search': ['find', 'lookup', 'query', 'filter'],
  'upload': ['import', 'add', 'attach', 'submit'],
  'download': ['export', 'save', 'get', 'retrieve'],
  'share': ['distribute', 'send', 'publish', 'broadcast'],
  'copy': ['duplicate', 'clone', 'replicate'],
  'move': ['transfer', 'relocate', 'migrate'],
  'workspace': ['desk', 'workstation', 'dashboard', 'environment'],
  'cart': ['basket', 'bag', 'shopping', 'checkout'],
  'home': ['house', 'main', 'start', 'dashboard'],
  'back': ['return', 'previous', 'undo', 'revert'],
  'forward': ['next', 'continue', 'advance', 'proceed'],
  'play': ['start', 'run', 'execute', 'begin'],
  'pause': ['stop', 'halt', 'suspend', 'break'],
  'lock': ['secure', 'protect', 'restrict', 'private'],
  'unlock': ['open', 'access', 'allow', 'public']
};

// Action + Object combinations
const COMMON_COMBINATIONS = {
  'add_user': {
    primary: 'person with plus sign',
    alternatives: ['user profile with add icon', 'person silhouette with plus']
  },
  'edit_file': {
    primary: 'document with pencil',
    alternatives: ['page with edit icon', 'file with cursor']
  },
  'delete_folder': {
    primary: 'folder with trash can',
    alternatives: ['directory with X', 'folder with minus sign']
  },
  'save_document': {
    primary: 'document with checkmark',
    alternatives: ['file with floppy disk', 'page with save icon']
  },
  'share_file': {
    primary: 'document with share arrows',
    alternatives: ['file with network icon', 'page with export arrows']
  },
  'upload_image': {
    primary: 'image with upload arrow',
    alternatives: ['photo with cloud', 'picture with up arrow']
  },
  'download_file': {
    primary: 'document with download arrow',
    alternatives: ['file with down arrow', 'page with cloud download']
  },
  'lock_settings': {
    primary: 'gear with lock',
    alternatives: ['settings with padlock', 'preferences with security']
  }
};

// Icon categories with common metaphors
const CATEGORY_METAPHORS = {
  action: {
    common: ['arrows', 'plus/minus', 'checkmarks', 'X marks', 'play/pause'],
    specific: {
      'create': ['plus sign', 'add icon', 'new symbol'],
      'delete': ['trash can', 'X mark', 'minus sign'],
      'edit': ['pencil', 'cursor', 'edit icon'],
      'save': ['checkmark', 'floppy disk', 'download arrow'],
      'share': ['share arrows', 'network icon', 'export symbol']
    }
  },
  object: {
    common: ['folders', 'files', 'devices', 'tools'],
    specific: {
      'folder': ['folder icon', 'directory symbol', 'container'],
      'file': ['document', 'page', 'text file'],
      'image': ['picture frame', 'photo', 'image icon'],
      'user': ['person silhouette', 'user profile', 'avatar']
    }
  },
  navigation: {
    common: ['arrows', 'chevrons', 'houses', 'menus'],
    specific: {
      'home': ['house icon', 'home symbol', 'dashboard'],
      'back': ['left arrow', 'back chevron', 'return'],
      'forward': ['right arrow', 'next chevron', 'continue'],
      'menu': ['hamburger menu', 'three lines', 'menu dots']
    }
  },
  status: {
    common: ['checkmarks', 'alerts', 'warnings', 'info'],
    specific: {
      'success': ['checkmark', 'tick', 'green circle'],
      'error': ['X mark', 'alert triangle', 'red circle'],
      'warning': ['exclamation', 'alert icon', 'yellow triangle'],
      'info': ['i icon', 'info circle', 'question mark']
    }
  }
};

/**
 * Generates multiple metaphor variants for a given context
 */
export function generateMetaphorVariants(context: MetaphorContext): MetaphorVariant[] {
  const variants: MetaphorVariant[] = [];
  
  // Extract key concepts
  const concepts = extractConcepts(context);
  
  // Generate variants for each concept
  for (const concept of concepts) {
    // Direct metaphor
    const directMetaphor = generateDirectMetaphor(concept);
    if (directMetaphor) {
      variants.push(directMetaphor);
    }
    
    // Synonym-based metaphors
    const synonymMetaphors = generateSynonymMetaphors(concept);
    variants.push(...synonymMetaphors);
    
    // Combination metaphors (for action + object)
    const combinationMetaphors = generateCombinationMetaphors(concept, context);
    variants.push(...combinationMetaphors);
  }
  
  // Sort by confidence and remove duplicates
  return variants
    .filter((v, i, arr) => arr.findIndex(a => a.metaphor === v.metaphor) === i)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Return top 5 variants
}

/**
 * Extracts key concepts from the context
 */
function extractConcepts(context: MetaphorContext): string[] {
  const concepts: string[] = [];
  
  // From text description
  if (context.textDescription) {
    const words = context.textDescription.toLowerCase().split(/\s+/);
    concepts.push(...words.filter(word => word.length > 2));
  }
  
  // From filename
  if (context.fileName) {
    const baseName = context.fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    const words = baseName.toLowerCase().split(/[_\-\s]+/);
    concepts.push(...words.filter(word => word.length > 2));
  }
  
  // From detected action/object
  if (context.detectedAction) concepts.push(context.detectedAction);
  if (context.detectedObject) concepts.push(context.detectedObject);
  
  return [...new Set(concepts)]; // Remove duplicates
}

/**
 * Generates direct metaphor for a concept
 */
function generateDirectMetaphor(concept: string): MetaphorVariant | null {
  // Check if concept has a category mapping
  for (const [category, metaphors] of Object.entries(CATEGORY_METAPHORS)) {
    if (metaphors.specific[concept]) {
      return {
        concept,
        metaphor: metaphors.specific[concept][0],
        confidence: 0.9,
        category,
        visualElements: metaphors.specific[concept]
      };
    }
  }
  
  // Fallback to literal concept
  return {
    concept,
    metaphor: concept,
    confidence: 0.6,
    category: 'generic',
    visualElements: [concept]
  };
}

/**
 * Generates metaphors based on synonyms
 */
function generateSynonymMetaphors(concept: string): MetaphorVariant[] {
  const variants: MetaphorVariant[] = [];
  
  // Check if concept has synonyms
  for (const [primary, synonyms] of Object.entries(METAPHOR_SYNONYMS)) {
    if (synonyms.includes(concept) || primary === concept) {
      // Generate metaphor for primary concept
      const primaryMetaphor = generateDirectMetaphor(primary);
      if (primaryMetaphor) {
        variants.push({
          ...primaryMetaphor,
          confidence: primary === concept ? 0.9 : 0.7
        });
      }
      
      // Generate metaphors for synonyms
      for (const synonym of synonyms) {
        if (synonym !== concept) {
          const synonymMetaphor = generateDirectMetaphor(synonym);
          if (synonymMetaphor) {
            variants.push({
              ...synonymMetaphor,
              confidence: 0.6
            });
          }
        }
      }
    }
  }
  
  return variants;
}

/**
 * Generates combination metaphors for action + object patterns
 */
function generateCombinationMetaphors(concept: string, context: MetaphorContext): MetaphorVariant[] {
  const variants: MetaphorVariant[] = [];
  
  // Check for common combinations
  for (const [combo, metaphors] of Object.entries(COMMON_COMBINATIONS)) {
    if (combo.includes(concept) || 
        (context.detectedAction && context.detectedObject && 
         combo === `${context.detectedAction}_${context.detectedObject}`)) {
      
      variants.push({
        concept: combo,
        metaphor: metaphors.primary,
        confidence: 0.85,
        category: 'combination',
        visualElements: [metaphors.primary, ...metaphors.alternatives]
      });
    }
  }
  
  return variants;
}

/**
 * Resolves a user prompt to standardized concept
 */
export function resolveMetaphor(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for exact matches in synonym mappings
  for (const [primary, synonyms] of Object.entries(METAPHOR_SYNONYMS)) {
    if (synonyms.some(synonym => lowerPrompt.includes(synonym)) || lowerPrompt.includes(primary)) {
      return primary;
    }
  }
  
  // Check for combination patterns
  for (const combo of Object.keys(COMMON_COMBINATIONS)) {
    const [action, object] = combo.split('_');
    if (lowerPrompt.includes(action) && lowerPrompt.includes(object)) {
      return combo;
    }
  }
  
  return prompt; // Return original if no match found
}

/**
 * Gets the best metaphor for a given context
 */
export function getBestMetaphor(context: MetaphorContext): MetaphorVariant | null {
  const variants = generateMetaphorVariants(context);
  return variants.length > 0 ? variants[0] : null;
}