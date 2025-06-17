#include <fbjni/core/fbjni.h>
#include <react/jni/JReactMarker.h>
#include <react/jni/JSLogging.h>
#include <react/jni/ReactRootView.h>

using namespace facebook::jni;
using namespace facebook::react;

class MainActivity : public Activity {
public:
    MainActivity() {}
};

extern "C" jint JNI_OnLoad(JavaVM* vm, void*) {
    return facebook::jni::initialize(vm, [] {
        MainActivity::registerNatives();
    });
} 