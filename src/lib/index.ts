import {
  CliRenderer,
  TextRenderable,
  BoxRenderable,
  GroupRenderable,
  InputRenderable,
  type TextOptions,
  type BoxOptions,
  type RenderableOptions,
  type InputRenderableOptions,
  InputRenderableEvents,
} from "@opentui/core";
import Reconciler from "react-reconciler";

interface HostContext {
  renderer: CliRenderer;
}

type BaseElementProps = {
  id?: string;
};

interface InputEventHandlers {
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
}

type OpenTUIElementProps<TProps, TRef> = TProps &
  BaseElementProps &
  React.Attributes & {
    key?: React.Key;
    ref?: React.Ref<TRef>;
    children?: React.ReactNode;
  };

type InputElementProps = OpenTUIElementProps<
  InputRenderableOptions & InputEventHandlers,
  InputRenderable
>;

// Clean JSX declaration using React's core types
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      textRenderable: OpenTUIElementProps<TextOptions, TextRenderable>;
      boxRenderable: OpenTUIElementProps<BoxOptions, BoxRenderable>;
      inputRenderable: InputElementProps;
      groupRenderable: OpenTUIElementProps<RenderableOptions, GroupRenderable>;
    }
  }
}

type OpenTUIElementTagName =
  | "textRenderable"
  | "boxRenderable"
  | "inputRenderable"
  | "groupRenderable";

type OpenTUIElement =
  | TextRenderable
  | BoxRenderable
  | GroupRenderable
  | InputRenderable;

// Strict discriminated union for element props
type ElementProps =
  | (RenderableOptions & BaseElementProps)
  | (TextOptions & BaseElementProps)
  | (BoxOptions & BaseElementProps)
  | (InputRenderableOptions & BaseElementProps & InputEventHandlers);

function applyTextProps(instance: TextRenderable, props: TextOptions) {
  // Apply all TextOptions properties
  Object.assign(instance, props);
  return instance;
}

function applyBoxProps(instance: BoxRenderable, props: BoxOptions) {
  // Apply all BoxOptions properties
  Object.assign(instance, props);
  return instance;
}

function applyInputProps(
  instance: InputRenderable,
  props: InputRenderableOptions
) {
  // Apply all InputRenderableOptions properties
  Object.assign(instance, props);
  return instance;
}

function applyGroupProps(instance: GroupRenderable, props: RenderableOptions) {
  // Apply all RenderableOptions properties
  Object.assign(instance, props);
  return instance;
}

// function applyElementProps(
//   instance: OpenTUIElement,
//   props: ElementProps
// ): void {
//   if (isTextProps(props) && instance instanceof TextRenderable) {
//     applyTextProps(instance, props);
//   } else if (isBoxProps(props) && instance instanceof BoxRenderable) {
//     applyBoxProps(instance, props);
//   } else if (isInputProps(props) && instance instanceof InputRenderable) {
//     applyInputProps(instance, props);
//   } else if (isGroupProps(props) && instance instanceof GroupRenderable) {
//     applyGroupProps(instance, props);
//   }
// }

// Helper function to setup event listeners
function setupEventListeners(
  instance: InputRenderable,
  props: InputRenderableOptions & BaseElementProps & InputEventHandlers
): void {
  if (instance instanceof InputRenderable) {
    if (props.onInput) {
      instance.on(InputRenderableEvents.INPUT, props.onInput);
    }
    if (props.onChange) {
      instance.on(InputRenderableEvents.CHANGE, props.onChange);
    }
    if (props.onEnter) {
      instance.on(InputRenderableEvents.ENTER, props.onEnter);
    }
  }
}

// Helper function to clean up event listeners
function cleanupEventListeners(
  instance: InputRenderable,
  props: InputRenderableOptions & BaseElementProps & InputEventHandlers
): void {
  if (instance instanceof InputRenderable) {
    if (props.onInput) {
      instance.off(InputRenderableEvents.INPUT, props.onInput);
    }
    if (props.onChange) {
      instance.off(InputRenderableEvents.CHANGE, props.onChange);
    }
    if (props.onEnter) {
      instance.off(InputRenderableEvents.ENTER, props.onEnter);
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
    type: OpenTUIElementTagName,
    props: ElementProps,
    rootContainer: HostContext,
    hostContext: HostContext,
    internalHandle: any
  ): OpenTUIElement {
    // console.log("createInstance", type, props);

    const { id } = props;
    let instance: OpenTUIElement;

    switch (type) {
      case "boxRenderable":
        instance = applyBoxProps(new BoxRenderable(id || "box", {}), props);
        break;

      case "groupRenderable":
        instance = applyGroupProps(
          new GroupRenderable(id || "group", {}),
          props
        );
        break;

      case "textRenderable":
        instance = applyTextProps(new TextRenderable(id || "text", {}), props);
        break;

      case "inputRenderable":
        instance = applyInputProps(
          new InputRenderable(id || "input", {}),
          props
        );
        setupEventListeners(instance as InputRenderable, props);
        break;
      default:
        throw new Error(`Unknown element type: ${type}`);
    }

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
      parentInstance.add(child);
    }
  },

  appendInitialChild(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      parentInstance.add(child);
    }
  },

  appendChildToContainer(
    container: HostContext,
    child: OpenTUIElement | null
  ): void {
    if (container.renderer?.root && child) {
      container.renderer.root.add(child);
    }
  },

  removeChild(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      parentInstance.remove(child.id);
      child.destroy(); // Clean up the child instance
    }
  },

  removeChildFromContainer(
    container: HostContext,
    child: OpenTUIElement | null
  ): void {
    if (container.renderer?.root && child) {
      container.renderer.root.remove(child.id);
      child.destroy();
    }
  },

  insertBefore(
    parentInstance: OpenTUIElement | null,
    child: OpenTUIElement | null,
    beforeChild: OpenTUIElement | null
  ): void {
    if (parentInstance && child) {
      const index =
        beforeChild && parentInstance.getChildren().indexOf(beforeChild);

      parentInstance.add(child, index ?? undefined);
    }
  },

  // Updates
  commitUpdate(
    instance: OpenTUIElement,
    updatePayload: ElementProps,
    type: OpenTUIElementTagName,
    prevProps: ElementProps,
    nextProps: ElementProps
  ): void {
    // console.log("commitUpdate", type, { prevProps, nextProps });

    // Apply type-specific properties
    switch (type) {
      case "boxRenderable":
        applyBoxProps(instance as BoxRenderable, nextProps);
        break;
      case "textRenderable":
        applyTextProps(instance as TextRenderable, nextProps);
        break;
      case "inputRenderable":
        const inputInstance = instance as InputRenderable;
        applyInputProps(inputInstance, nextProps);
        setupEventListeners(inputInstance, nextProps);
        break;
      case "groupRenderable":
        applyGroupProps(instance as GroupRenderable, nextProps);
        break;
      default:
        throw new Error(`Unknown element type: ${type}`);
    }
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
