import {
  CliRenderer,
  TextRenderable,
  BoxRenderable,
  GroupRenderable,
  InputRenderable,
  RGBA,
  type Position,
} from "@opentui/core";
import Reconciler from "react-reconciler";

interface HostContext {
  renderer: CliRenderer;
}

type OpenTUIElement =
  | TextRenderable
  | BoxRenderable
  | GroupRenderable
  | InputRenderable;

interface ElementProps {
  // Common props
  id?: string;
  x?: number;
  y?: number;
  width?: number | "auto";
  height?: number | "auto";
  visible?: boolean;
  position?: "absolute" | "relative";

  // Box props
  backgroundColor?: string | RGBA;
  borderColor?: string | RGBA;
  borderStyle?: string;
  border?: boolean;

  // Text props
  content?: string;
  fg?: string | RGBA;
  bg?: string | RGBA;
  selectable?: boolean;

  // Input props
  placeholder?: string;
  value?: string;
  maxLength?: number;
  textColor?: string | RGBA;
  focusedBackgroundColor?: string | RGBA;
  focusedTextColor?: string | RGBA;

  // Event handlers
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
  onSelectionChanged?: (index: number, option: any) => void;
  onItemSelected?: (index: number, option: any) => void;
}

// Helper function to apply common properties
function applyCommonProps(instance: OpenTUIElement, props: ElementProps): void {
  // TODO : handle this bit more gracefully
  if (props.x !== undefined) instance.x = props.x;
  if (props.y !== undefined) instance.y = props.y;
  if (props.width !== undefined) instance.width = props.width;
  if (props.height !== undefined) instance.height = props.height;
  if (props.visible !== undefined) instance.visible = props.visible;
  if (props.position !== undefined)
    instance.setPosition(props.position as Position);
  if (props.borderStyle !== undefined) {
    //@ts-expect-error
    instance.borderStyle = props.borderStyle;
  }
  if (props.borderColor !== undefined) {
    //@ts-expect-error
    instance.borderColor = props.borderColor;
  }
}

// Helper function to apply Box-specific properties
function applyBoxProps(instance: BoxRenderable, props: ElementProps): void {
  if (props.backgroundColor !== undefined) {
    instance.backgroundColor = props.backgroundColor;
  }
  if (props.borderColor !== undefined) {
    instance.borderColor = props.borderColor;
  }
}

// Helper function to apply Text-specific properties
function applyTextProps(instance: TextRenderable, props: ElementProps): void {
  if (props.content !== undefined) {
    instance.content = props.content;
  }
  if (props.fg !== undefined) {
    instance.fg = props.fg;
  }
  if (props.bg !== undefined) {
    instance.bg = props.bg;
  }
  if (props.selectable !== undefined) {
    instance.selectable = props.selectable;
  }
}

// Helper function to apply Input-specific properties
function applyInputProps(instance: InputRenderable, props: ElementProps): void {
  if (props.placeholder !== undefined) {
    instance.placeholder = props.placeholder;
  }
  if (props.value !== undefined) {
    instance.value = props.value;
  }
  if (props.maxLength !== undefined) {
    instance.maxLength = props.maxLength;
  }
  if (props.textColor !== undefined) {
    instance.textColor = props.textColor;
  }
  if (props.focusedBackgroundColor !== undefined) {
    instance.focusedBackgroundColor = props.focusedBackgroundColor;
  }
  if (props.focusedTextColor !== undefined) {
    instance.focusedTextColor = props.focusedTextColor;
  }
}

// Helper function to setup event listeners
function setupEventListeners(
  instance: OpenTUIElement,
  props: ElementProps
): void {
  if (instance instanceof InputRenderable) {
    if (props.onInput) {
      instance.on("input", props.onInput);
    }
    if (props.onChange) {
      instance.on("change", props.onChange);
    }
    if (props.onEnter) {
      instance.on("enter", props.onEnter);
    }
  }
}

// Helper function to clean up event listeners
function cleanupEventListeners(
  instance: OpenTUIElement,
  props: ElementProps
): void {
  if (instance instanceof InputRenderable) {
    if (props.onInput) {
      instance.off("input", props.onInput);
    }
    if (props.onChange) {
      instance.off("change", props.onChange);
    }
    if (props.onEnter) {
      instance.off("enter", props.onEnter);
    }
  }
}

// React 18 reconciler configuration
const reconciler = Reconciler({
  // Required basic config
  supportsMutation: true,
  supportsPersistence: false,
  isPrimaryRenderer: false,
  supportsHydration: false,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  // React 18 scheduling
  scheduleMicrotask:
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (callback: () => void) => Promise.resolve().then(callback),

  // Host config methods
  getRootHostContext(rootContainer: HostContext): HostContext {
    return rootContainer;
  },

  getChildHostContext(parentHostContext: HostContext): HostContext {
    return parentHostContext;
  },

  // Instance creation
  createInstance(
    type: string,
    props: ElementProps,
    rootContainer: HostContext,
    hostContext: HostContext,
    internalHandle: any
  ): OpenTUIElement {
    // console.log("createInstance", type, props);

    const { id } = props;
    let instance: OpenTUIElement;

    switch (type) {
      case "box":
        instance = new BoxRenderable(id || "box", {
          position: props.position || "absolute",
          left: props.x ?? 0,
          top: props.y ?? 0,
          width: props.width ?? 20,
          height: props.height ?? 10,
          backgroundColor:
            props.backgroundColor || RGBA.fromInts(20, 20, 40, 255),
          borderColor: props.borderColor || RGBA.fromInts(255, 255, 255, 255),
        });
        applyBoxProps(instance as BoxRenderable, props);
        break;

      case "group":
        instance = new GroupRenderable(id || "group", {
          position: props.position || "relative",
          left: props.x ?? 0,
          top: props.y ?? 0,
          width: props.width ?? "auto",
          height: props.height ?? "auto",
        });
        break;

      case "text":
        instance = new TextRenderable(id || "text", {
          content: props.content || "",
          fg: props.fg,
          bg: props.bg,
          selectable: props.selectable ?? true,
          position: props.position || "relative",
          left: props.x ?? 0,
          top: props.y ?? 0,
          width: props.width ?? "auto",
          height: props.height ?? "auto",
        });
        break;

      case "input":
        instance = new InputRenderable(id || "input", {
          position: props.position || "relative",
          left: props.x ?? 0,
          top: props.y ?? 0,
          width: props.width ?? 20,
          height: props.height ?? 3,
          placeholder: props.placeholder,
          value: props.value,
          maxLength: props.maxLength,
          textColor: props.textColor,
          focusedBackgroundColor: props.focusedBackgroundColor,
          focusedTextColor: props.focusedTextColor,
        });
        break;
      default:
        throw new Error(`Unknown element type: ${type}`);
    }

    cleanupEventListeners(instance, props);

    // Apply common properties
    applyCommonProps(instance, props);

    // Setup event listeners
    setupEventListeners(instance, props);

    return instance;
  },

  createTextInstance(
    text: string,
    rootContainer: HostContext,
    hostContext: HostContext,
    internalHandle: any
  ): null {
    // We don't create text instances - text content is handled via props
    console.warn(
      "Text nodes are not supported. Use content prop on text element instead."
    );
    return null;
  },

  getPublicInstance(instance: OpenTUIElement | null): OpenTUIElement | null {
    return instance;
  },

  // Prepare phase - return update payload
  prepareUpdate(
    instance: OpenTUIElement,
    type: string,
    oldProps: ElementProps,
    newProps: ElementProps,
    rootContainer: HostContext,
    hostContext: HostContext
  ): ElementProps | null {
    // console.log("prepareUpdate", type, { oldProps, newProps });

    // Compare props and return new props if different
    // const hasChanges = JSON.stringify(oldProps) !== JSON.stringify(newProps);
    return newProps;
  },

  // Commit phase
  prepareForCommit(containerInfo: HostContext): null {
    return null;
  },

  resetAfterCommit(containerInfo: HostContext): void {
    // Trigger a render cycle if needed
    if (containerInfo.renderer) {
      // The renderer will handle the next frame automatically
    }
  },

  // Text content
  shouldSetTextContent(type: string, props: ElementProps): boolean {
    return false; // We handle text through content prop
  },

  finalizeInitialChildren(): boolean {
    return false;
  },

  // Container operations
  clearContainer(container: HostContext): void {
    if (container.renderer?.root) {
      container.renderer.root.getChildren().forEach((child) => {
        // console.log("Removing child:", child.constructor.name);
        container.renderer!.root!.remove(child.id);
      });
    }
  },

  // Tree operations
  appendChild(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      console.log(
        "appendChild",
        parentInstance.constructor.name,
        "->",
        child.constructor.name
      );
      parentInstance.add(child);
    }
  },

  appendInitialChild(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      console.log(
        "appendInitialChild",
        parentInstance.constructor.name,
        "->",
        child.constructor.name
      );

      parentInstance.add(child);
    }
  },

  appendChildToContainer(
    container: HostContext,
    child: OpenTUIElement | null
  ): void {
    if (container.renderer?.root && child) {
      console.log("appendChildToContainer", child.constructor.name);
      container.renderer.root.add(child);
    }
  },

  removeChild(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      console.log(
        "removeChild",
        child.constructor.name,
        "from",
        parentInstance.constructor.name
      );
      parentInstance.remove(child.id);
      child.destroy(); // Clean up the child instance
    }
  },

  removeChildFromContainer(
    container: HostContext,
    child: OpenTUIElement | null
  ): void {
    if (container.renderer?.root && child) {
      //   console.log("removeChildFromContainer", child.constructor.name);
      //   container.renderer.root.remove(child);
      container.renderer.root.remove(child.id);
      child.destroy(); // Clean up the child instance
    }
  },

  insertBefore(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null,
    beforeChild: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      console.log(
        "insertBefore",
        child.constructor.name,
        "before",
        beforeChild?.constructor.name
      );
      // For now, just append - OpenTUI might not support insertion at specific index
      const index =
        beforeChild && parentInstance.getChildren().indexOf(beforeChild);

      parentInstance.add(child, index ?? undefined);
    }
  },

  // Updates
  commitUpdate(
    instance: OpenTUIElement,
    updatePayload: ElementProps,
    type: string,
    prevProps: ElementProps,
    nextProps: ElementProps
  ): void {
    // console.log("commitUpdate", type, { prevProps, nextProps });

    // Clean up old event listeners
    // cleanupEventListeners(instance, prevProps);

    // Apply common properties
    applyCommonProps(instance, nextProps);

    // Apply type-specific properties
    switch (type) {
      case "box":
        applyBoxProps(instance as BoxRenderable, nextProps);
        break;
      case "text":
        applyTextProps(instance as TextRenderable, nextProps);
        break;
      case "input":
        applyInputProps(instance as InputRenderable, nextProps);
        break;
    }

    // Setup new event listeners
    // setupEventListeners(instance, nextProps);
  },

  commitTextUpdate(textInstance: null, oldText: string, newText: string): void {
    // Not used since we don't create text instances
    console.warn("commitTextUpdate called - this should not happen");
  },

  // Additional React 18 methods
  hideInstance(instance: OpenTUIElement): void {
    instance.visible = false;
  },

  unhideInstance(instance: OpenTUIElement): void {
    instance.visible = true;
  },

  hideTextInstance(textInstance: null): void {
    // Not applicable
  },

  unhideTextInstance(textInstance: null): void {
    // Not applicable
  },

  //@ts-expect-error
  errorHydratingElement(): void {
    // Error handling during hydration
  },

  // Resource support (React 18 features)
  getInstanceFromNode(): null {
    return null;
  },

  beforeActiveInstanceBlur(): void {},
  afterActiveInstanceBlur(): void {},
  prepareScopeUpdate(): void {},
  getInstanceFromScope(): null {
    return null;
  },
  detachDeletedInstance(): void {},
});

let renderer: CliRenderer | null = null;
let reconcilerContainer: ReturnType<typeof reconciler.createContainer> | null =
  null;

const render = async (element: React.ReactNode, rendererRoot: CliRenderer) => {
  //   console.log("Starting render process...");

  try {
    renderer = rendererRoot;

    // console.log("CliRenderer created successfully");

    const hostContext: HostContext = { renderer };

    // Use legacy root for now to avoid React 18 complexities
    reconcilerContainer = reconciler.createContainer(
      hostContext,
      0, // Use legacy mode instead of ConcurrentRoot
      null,
      false,
      null,
      "",
      (error: any) => console.error("Reconciler error:", error),
      null
    );

    // console.log("Reconciler container created");

    reconciler.updateContainer(element, reconcilerContainer, null, () => {});

    return { renderer };
  } catch (error) {
    console.error("Error in render process:", error);
    throw error;
  }
};

const unmountComponentAtNode = () => {
  if (reconcilerContainer && renderer) {
    reconciler.updateContainer(null, reconcilerContainer, null, () => {
      //   console.log("Component unmounted");
      renderer?.destroy();
      renderer = null;
      reconcilerContainer = null;
    });
  }
};

export const createRoot = () => ({
  render: (element: React.ReactNode, cliRenderer: CliRenderer) =>
    render(element, cliRenderer),
  unmount: () => unmountComponentAtNode(),
});
