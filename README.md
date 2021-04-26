# ColorPluck

A color picker app by Aaron Smulktis using React Native & TypeScript.

This project was created without expo as a **bare workflow** React Native TS application.

**Running locally:**

- Navigate to project root
- Run `yarn && yarn start`
- In a separate terminal window, run `yarn ios`
Or, alternatively:
- Open `ios/ColorPluckTS.workspace` in XCode.app
- Press the "play" button to run the app

Notes:

- I started my solution by selectively taking some logic & math from `react-native-color-wheel`, but with everything updated to use hooks, typescript, and incorporate the brightness slider
- I spent about 4-5 hours on this solution in total, I would've loved to have had the time to add the swatches, finish styling to spec, and fix the bug on the PanResponder when dragging the color selector loupe
- I've left a few comments in the code for added context
- Expo was added later in an effort to publish the app, and produce a tunnel link for sharing, the `expo-cli` scripts do not work correctly yet