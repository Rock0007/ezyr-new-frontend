"use client";

import { ConfigProvider, App as AntdApp, theme } from "antd";
import { Provider } from "react-redux";
import { registerAntDesignAdapters } from "@/components/adapters/ant-design";
import { store } from "@/store/store";

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
            colorPrimary: "#0f8ca8",
            borderRadius: 6,
            colorBgLayout: "#f5f7fb",
            fontFamily: "var(--font-geist-sans)",
          },
          components: {
            Layout: {
              bodyBg: "#f5f7fb",
              headerBg: "#ffffff",
              siderBg: "#ffffff",
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </Provider>
  );
}
