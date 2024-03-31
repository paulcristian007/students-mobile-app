import {Animation} from "@ionic/react";

export function containsDigits(str: string) {
    const regex = /\d/;
    return regex.test(str);
}

export function isValidNumber(str: string): boolean {
    const number = parseInt(str);
    return !isNaN(number) && number.toString() === str;
}
export const play = (animation: any) => {
    animation.current?.play();
};
export const pause = (animation: any) => {
    animation.current?.pause();
};
export const stop = (animation: any) => {
    animation.current?.stop();
};
