import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, useColorScheme } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { setOnboardingComplete } from '../store/slices/onboardingSlice';
import { semantic, brand, misc } from '../constants/Colors';
import { ONBOARDING_STRINGS } from '../constants/Strings';
import Screen from '../components/Screen';
import Button from '../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const slides = ONBOARDING_STRINGS.SLIDES;

export default function OnboardingCarouselScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const isDark = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    dispatch(setOnboardingComplete());
    // Navigation will automatically switch to Auth screen
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <Screen>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.content}>
              <Text style={styles.image}>{slide.image}</Text>
              <Text style={[styles.title, { color: semantic.text(isDark) }]}>
                {slide.title}
              </Text>
              <Text style={[styles.description, { color: semantic.textSecondary(isDark) }]}>
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? brand.primary : misc.dotInactive,
                },
              ]}
            />
          ))}
        </View>
        <Button
          title={currentIndex === slides.length - 1 ? ONBOARDING_STRINGS.GET_STARTED : ONBOARDING_STRINGS.NEXT}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  image: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: '100%',
  },
});
