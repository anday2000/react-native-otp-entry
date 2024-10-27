import { forwardRef, useImperativeHandle, useMemo } from "react";
import { Animated, Platform, Pressable, Text, TextInput, View } from "react-native";
import { styles } from "./OtpInput.styles";
import { OtpInputProps, OtpInputRef } from "./OtpInput.types";
import { VerticalStick } from "./VerticalStick";
import { useOtpInput } from "./useOtpInput";

export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>((props, ref) => {
  const {
    models: { text, inputRef, focusedInputIndex, isFocused },
    actions: { clear, handlePress, handleTextChange, focus, handleFocus, handleBlur },
    forms: { setTextWithRef },
  } = useOtpInput(props);
  const {
    disabled,
    numberOfDigits = 6,
    autoFocus = true,
    hideStick,
    focusColor = "#A4D0A4",
    focusStickBlinkingDuration,
    secureTextEntry = false,
    theme = {},
    textInputProps,
    type = "numeric",
    useAnimatedComponents = false,
  } = props;
  const {
    containerStyle,
    inputsContainerStyle,
    pinCodeContainerStyle,
    pinCodeTextStyle,
    focusStickStyle,
    focusedPinCodeContainerStyle,
    filledPinCodeContainerStyle,
    disabledPinCodeContainerStyle,
  } = theme;

  useImperativeHandle(ref, () => ({ clear, focus, setValue: setTextWithRef }));

  const generatePinCodeContainerStyle = (isFocusedContainer: boolean, char: string) => {
    const stylesArray = [styles.codeContainer, pinCodeContainerStyle];
    if (focusColor && isFocusedContainer) {
      stylesArray.push({ borderColor: focusColor });
    }

    if (focusedPinCodeContainerStyle && isFocusedContainer) {
      stylesArray.push(focusedPinCodeContainerStyle);
    }

    if (filledPinCodeContainerStyle && Boolean(char)) {
      stylesArray.push(filledPinCodeContainerStyle);
    }

    if (disabledPinCodeContainerStyle && disabled) {
      stylesArray.push(disabledPinCodeContainerStyle);
    }

    return stylesArray;
  };

  const { ViewComponent, PressableComponent, TextComponent } = useMemo(() => {
    if (useAnimatedComponents) {
      return {
        ViewComponent: Animated.View,
        PressableComponent: Animated.createAnimatedComponent(Pressable),
        TextComponent: Animated.Text,
      };
    }
    return { ViewComponent: View, PressableComponent: Pressable, TextComponent: Text };
  }, [useAnimatedComponents]);

  return (
    <ViewComponent style={[styles.container, containerStyle, inputsContainerStyle]}>
      {Array(numberOfDigits)
        .fill(0)
        .map((_, index) => {
          const char = text[index];
          const isFocusedInput = index === focusedInputIndex && !disabled && Boolean(isFocused);
          const isFilledLastInput = text.length === numberOfDigits && index === text.length - 1;
          const isFocusedContainer = isFocusedInput || (isFilledLastInput && Boolean(isFocused));

          return (
            <PressableComponent
              key={`${char}-${index}`}
              disabled={disabled}
              onPress={handlePress}
              style={generatePinCodeContainerStyle(isFocusedContainer, char)}
              testID="otp-input"
            >
              {isFocusedInput && !hideStick ? (
                <VerticalStick
                  focusColor={focusColor}
                  style={focusStickStyle}
                  focusStickBlinkingDuration={focusStickBlinkingDuration}
                />
              ) : (
                <TextComponent style={[styles.codeText, pinCodeTextStyle]}>
                  {char && secureTextEntry ? "•" : char}
                </TextComponent>
              )}
            </PressableComponent>
          );
        })}
      <TextInput
        value={text}
        onChangeText={handleTextChange}
        maxLength={numberOfDigits}
        inputMode={type === "numeric" ? type : "text"}
        textContentType="oneTimeCode"
        ref={inputRef}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        aria-disabled={disabled}
        editable={!disabled}
        testID="otp-input-hidden"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
        style={[styles.hiddenInput, textInputProps?.style]}
      />
    </ViewComponent>
  );
});
