"use client";

import { ConfigProvider, App as AntdApp, theme } from "antd";
import { Provider } from "react-redux";
import { registerAntDesignAdapters } from "@/components/adapters/ant-design";
import { store } from "@/store/store";
import { platformColors, platformTheme } from "@/theme/colors";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  registerAntDesignAdapters();

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            ...platformTheme,
            colorText: platformColors.ink,
            colorTextSecondary: platformColors.inkSubtle,
            colorBorder: platformColors.border,
          },
          components: {
            Layout: {
              bodyBg: "#f5f7fb",
              headerBg: platformColors.surface,
              siderBg: platformColors.surface,
            },
            Input: {
              activeBorderColor: platformColors.brand,
              hoverBorderColor: platformColors.brand,
            },
            Select: {
              activeBorderColor: platformColors.brand,
              hoverBorderColor: platformColors.brand,
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </Provider>
  );
}
