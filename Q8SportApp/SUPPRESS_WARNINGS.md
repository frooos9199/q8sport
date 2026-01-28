# في نهاية ملف Podfile أضف هذا:

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # رفع الحد الأدنى لـ iOS إلى 12.0
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
      
      # إخفاء تحذيرات الـ deprecation
      config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
      config.build_settings['CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS'] = 'NO'
    end
  end
end
