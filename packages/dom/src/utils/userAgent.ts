interface NavigatorUAData {
  brands: Array<{brand: string; version: string}>;
  mobile: boolean;
  platform: string;
}

let uaString: string | undefined;

/**
 * *如果浏览器支持 navigator.userAgentData 那么将返回处理后的 userAgentData.brands； 否则返回 navigator.userAgent
 * */
export function getUAString(): string {
  if (uaString) {
    return uaString;
  }

  // userAgentData 详见：https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData 兼兼容性比较差
  const uaData = (navigator as any).userAgentData as
    | NavigatorUAData
    | undefined;

  if (uaData && Array.isArray(uaData.brands)) {
    uaString = uaData.brands
      .map((item) => `${item.brand}/${item.version}`)
      .join(' ');
    return uaString;
  }

  return navigator.userAgent;
}
