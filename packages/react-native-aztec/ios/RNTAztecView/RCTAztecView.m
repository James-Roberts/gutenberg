#import <objc/runtime.h>

// We need to swizzle the 'setupForDictationStart' method to implement a workaround for the bug in https://github.com/wordpress-mobile/gutenberg-mobile/issues/5165
// Credit: https://stackoverflow.com/questions/74024881/detect-text-is-entered-using-dictation-on-ios-16/74024882

@interface NSObject(PrivateSwizzleCategory)
- (void)swizzled_setupForDictationStart;
@end

@implementation NSObject(PrivateSwizzleCategory)
- (void)swizzled_setupForDictationStart {
    [(NSObject *)self swizzled_setupForDictationStart];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"UIDictationControllerWillStart" object:nil];
}
@end

@implementation UIDictationController
+ (void)load {
    Method original, swizzled;
        original = class_getInstanceMethod(objc_getClass("UIDictationController"), NSSelectorFromString(@"setupForDictationStart"));
        swizzled = class_getInstanceMethod(objc_getClass("NSObject"), @selector(swizzled_setupForDictationStart));
        method_exchangeImplementations(original, swizzled);
}
@end
