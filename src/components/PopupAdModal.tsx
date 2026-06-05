import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../lib/theme';
import type { PopupAd } from '../lib/popupAds';
import FastAdImage from './FastAdImage';

type Props = {
  visible: boolean;
  ad: PopupAd | null;
  onClose: () => void;
  onPressAd?: () => void;
};

export default function PopupAdModal({ visible, ad, onClose, onPressAd }: Props) {
  if (!ad) return null;

  const canPress = Boolean(ad.linkType !== 'none' && ad.linkUrl);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={canPress ? 0.92 : 1}
            disabled={!canPress}
            onPress={onPressAd}
            style={s.imageWrap}
          >
            <FastAdImage uri={ad.imageUrl} style={s.image} showWatermark={false} />
          </TouchableOpacity>

          {ad.title || ad.description ? (
            <View style={s.textWrap}>
              {ad.title ? <Text style={s.title}>{ad.title}</Text> : null}
              {ad.description ? <Text style={s.desc}>{ad.description}</Text> : null}
            </View>
          ) : null}

          <TouchableOpacity style={s.dismissBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.dismissText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.xl,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  closeBtn: {
    position: 'absolute',
    zIndex: 5,
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  imageWrap: {
    width: '100%',
    backgroundColor: colors.metal,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  textWrap: {
    padding: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    color: colors.silver,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  dismissBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.metal,
    borderWidth: 1,
    borderColor: colors.metalBorder,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
});
