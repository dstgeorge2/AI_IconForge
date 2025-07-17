// ICON NAME → INTENT PARSING LOGIC
// Enhanced filename parsing with object mapping and metaphor suggestions

export function parseIconName(name) {
  // Remove file extension and convert to lowercase
  const cleanName = name.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, '').toLowerCase();
  const tokens = cleanName.split(/[-_]/);

  // Step 1: Identify action
  const knownActions = [
    "add", "delete", "edit", "view", "create", "remove",
    "open", "close", "duplicate", "download", "upload", 
    "link", "unlink", "move", "save", "refresh", "undo",
    "copy", "cut", "paste", "search", "filter", "sort",
    "play", "pause", "stop", "forward", "backward", "next",
    "previous", "home", "back", "forward", "settings", "config"
  ];

  let action = tokens[0];
  if (!knownActions.includes(action)) {
    // Check if any token is a known action
    action = tokens.find(token => knownActions.includes(token)) || "unknown";
  }

  // Step 2: Detect object
  let object = "unknown";
  for (let i = 1; i < tokens.length; i++) {
    if (!["to", "from", "with", "in", "on", "at", "by"].includes(tokens[i])) {
      object = tokens[i];
      break;
    }
  }

  // Step 3: Check for known modifiers
  const modifier = 
    tokens.includes("new") ? "new" :
    tokens.includes("active") ? "active" :
    tokens.includes("inactive") ? "inactive" :
    tokens.includes("alert") ? "alert" :
    tokens.includes("warning") ? "warning" :
    tokens.includes("error") ? "error" :
    tokens.includes("success") ? "success" :
    tokens.includes("pending") ? "pending" :
    tokens.includes("locked") ? "locked" :
    tokens.includes("unlocked") ? "unlocked" :
    null;

  // Step 4: Enhanced metaphor suggestions based on object
  const objectMap = {
    // Workspace & Environment
    "desk": "l_shape_surface",
    "workspace": "grouped_squares",
    "environment": "layered_rectangles",
    "context": "nested_frames",
    "space": "outlined_rectangle",
    
    // Documents & Files
    "file": "document_rectangle",
    "document": "document_rectangle",
    "page": "document_rectangle",
    "sheet": "grid_rectangle",
    "report": "document_with_lines",
    "text": "text_lines",
    "code": "code_brackets",
    
    // Containers & Organization
    "folder": "folder_shape",
    "directory": "folder_shape",
    "container": "box_outline",
    "group": "grouped_circles",
    "collection": "stacked_rectangles",
    "library": "book_stack",
    
    // Identity & Users
    "user": "circle_with_person",
    "profile": "circle_with_person",
    "account": "shield_with_person",
    "person": "circle_with_person",
    "member": "circle_with_person",
    "team": "multiple_circles",
    
    // System & Network
    "server": "cylinder_shape",
    "system": "gear_circle",
    "machine": "rectangle_with_dots",
    "device": "rounded_rectangle",
    "hardware": "chip_rectangle",
    "node": "circle_with_connections",
    "network": "connected_circles",
    "connection": "chain_links",
    "link": "chain_links",
    "bridge": "arc_connection",
    
    // Interface & Controls
    "widget": "rounded_square",
    "component": "box_with_label",
    "control": "slider_shape",
    "element": "basic_rectangle",
    "button": "pill_shape",
    "menu": "hamburger_lines",
    "dropdown": "chevron_down",
    "modal": "overlay_rectangle",
    
    // Data & Information
    "data": "database_cylinder",
    "information": "info_circle",
    "content": "document_lines",
    "record": "table_row",
    "entry": "input_field",
    "database": "database_cylinder",
    "table": "grid_structure",
    
    // Tools & Utilities
    "tool": "hammer_wrench",
    "utility": "gear_circle",
    "helper": "question_circle",
    "service": "cloud_shape",
    "function": "brackets_shape",
    "plugin": "puzzle_piece",
    
    // Actions & States
    "settings": "gear_circle",
    "config": "slider_controls",
    "preferences": "checkmark_list",
    "options": "dots_menu",
    "trash": "trash_bin",
    "recycle": "refresh_arrows",
    "archive": "box_closed",
    "backup": "cloud_upload",
    
    // Media & Content
    "image": "picture_frame",
    "photo": "picture_frame",
    "video": "play_triangle",
    "audio": "sound_waves",
    "music": "note_symbol",
    "camera": "camera_outline",
    
    // Communication
    "message": "speech_bubble",
    "chat": "speech_bubble",
    "mail": "envelope_shape",
    "email": "envelope_shape",
    "notification": "bell_shape",
    "alert": "triangle_exclamation",
    "warning": "triangle_exclamation",
    
    // Navigation
    "home": "house_outline",
    "back": "arrow_left",
    "forward": "arrow_right",
    "up": "arrow_up",
    "down": "arrow_down",
    "next": "chevron_right",
    "previous": "chevron_left",
    
    // Commerce & Business
    "cart": "shopping_cart",
    "checkout": "credit_card",
    "payment": "credit_card",
    "invoice": "document_dollar",
    "order": "list_numbered",
    "product": "box_outline",
    "store": "storefront",
    
    // Time & Calendar
    "calendar": "calendar_grid",
    "date": "calendar_day",
    "time": "clock_circle",
    "schedule": "calendar_lines",
    "event": "calendar_dot",
    "reminder": "bell_clock",
    
    // Security & Privacy
    "lock": "padlock_closed",
    "unlock": "padlock_open",
    "key": "key_shape",
    "password": "asterisk_dots",
    "security": "shield_outline",
    "privacy": "eye_slash"
  };

  // Step 5: Determine icon role based on action and context
  const iconRole = 
    ["add", "create", "new"].includes(action) ? "action-button" :
    ["edit", "modify", "update"].includes(action) ? "action-button" :
    ["delete", "remove", "trash"].includes(action) ? "destructive-action" :
    ["view", "show", "display"].includes(action) ? "navigation" :
    ["save", "export", "download"].includes(action) ? "persistence" :
    ["settings", "config", "preferences"].includes(action) ? "configuration" :
    "general-interface";

  // Step 6: Determine contextual scope
  const contextualScope = 
    ["toolbar", "menu", "button"].some(term => tokens.includes(term)) ? "toolbar" :
    ["nav", "navigation", "sidebar"].some(term => tokens.includes(term)) ? "navigation" :
    ["modal", "dialog", "popup"].some(term => tokens.includes(term)) ? "modal" :
    ["status", "indicator", "badge"].some(term => tokens.includes(term)) ? "status" :
    "general interface";

  return {
    name: cleanName,
    original_filename: name,
    action,
    object,
    modifier,
    metaphor: objectMap[object] || "rectangle",
    description: capitalize(action) + " " + object,
    semantic_tags: [action, object, modifier].filter(Boolean),
    icon_role: iconRole,
    contextual_scope: contextualScope,
    intent: action + " " + object,
    complexity_level: tokens.length <= 2 ? "simple" : tokens.length <= 4 ? "moderate" : "complex"
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Enhanced action detection with priority
export function detectPrimaryAction(tokens) {
  const highPriorityActions = ["add", "delete", "edit", "save", "open", "close"];
  const mediumPriorityActions = ["view", "show", "create", "remove", "copy", "move"];
  const lowPriorityActions = ["display", "browse", "explore", "navigate"];
  
  for (const token of tokens) {
    if (highPriorityActions.includes(token)) return { action: token, priority: "high" };
  }
  for (const token of tokens) {
    if (mediumPriorityActions.includes(token)) return { action: token, priority: "medium" };
  }
  for (const token of tokens) {
    if (lowPriorityActions.includes(token)) return { action: token, priority: "low" };
  }
  
  return { action: "unknown", priority: "unknown" };
}

// Object detection with categorization
export function detectPrimaryObject(tokens) {
  const objectCategories = {
    workspace: ["desk", "workspace", "environment", "context"],
    document: ["file", "document", "page", "sheet", "report"],
    container: ["folder", "directory", "container", "group"],
    identity: ["user", "profile", "account", "person"],
    system: ["server", "system", "machine", "device"],
    interface: ["widget", "component", "control", "element"],
    data: ["data", "information", "content", "record"]
  };
  
  for (const [category, objects] of Object.entries(objectCategories)) {
    const found = tokens.find(token => objects.includes(token));
    if (found) return { object: found, category, priority: "high" };
  }
  
  return { object: "unknown", category: "unknown", priority: "unknown" };
}

// Context inference from filename patterns
export function inferContextFromPattern(filename) {
  const patterns = {
    toolbar: /^(add|edit|delete|save|open|close)_/,
    navigation: /^(view|show|display|browse|explore)_/,
    status: /_(active|inactive|pending|complete|error|warning|success)$/,
    modal: /_(modal|dialog|popup|overlay)_/,
    form: /_(input|field|form|submit|validate)_/,
    media: /_(image|photo|video|audio|play|pause|stop)_/
  };
  
  for (const [context, pattern] of Object.entries(patterns)) {
    if (pattern.test(filename)) return context;
  }
  
  return "general";
}

export default parseIconName;