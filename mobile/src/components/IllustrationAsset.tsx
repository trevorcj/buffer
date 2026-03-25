import { useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

interface IllustrationAssetProps {
  source: number;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
}

export function IllustrationAsset({
  source,
  width,
  height,
  style,
}: IllustrationAssetProps) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAsset = async () => {
      const asset = Asset.fromModule(source);

      try {
        await asset.downloadAsync();
      } catch {
        // The asset can still be readable via its dev-server URI.
      }

      if (isMounted) {
        setUri(asset.localUri ?? asset.uri ?? null);
      }
    };

    void loadAsset();

    return () => {
      isMounted = false;
    };
  }, [source]);

  if (!uri) {
    return <View style={[{ width, height }, style]} />;
  }

  return <SvgUri height={height} style={style} uri={uri} width={width} />;
}
