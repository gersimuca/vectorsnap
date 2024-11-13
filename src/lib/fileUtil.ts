import type { ChangeEvent } from "react";

const noop = () => {
    /* eslint-disable no-console */
};

export function createFileChangeEvent(file: File): ChangeEvent<HTMLInputElement> {
    const target: Partial<HTMLInputElement> = {
        files: [file] as unknown as FileList,
        value: "",
        type: "file",
        accept: ".svg",
        multiple: false,
        webkitdirectory: false,
        className: "hidden",
    };

    return {
        target: target as HTMLInputElement,
        currentTarget: target as HTMLInputElement,
        preventDefault: noop,
        stopPropagation: noop,
        bubbles: true,
        cancelable: true,
        timeStamp: Date.now(),
        type: "change",
        nativeEvent: new Event("change"),
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        isTrusted: true,
        persist: noop
    } as ChangeEvent<HTMLInputElement>;
}