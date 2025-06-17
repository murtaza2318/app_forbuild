cmake_minimum_required(VERSION 3.13)

project("app")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Add the following flags to fix compilation issues
add_compile_options(
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_HAVE_CLOCK_GETTIME=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_CFG_NO_COROUTINES=1
    -DFOLLY_MOBILE=1
    -DFOLLY_HAVE_RECVMMSG=1
    -DFOLLY_HAVE_PTHREAD=1
    -DFOLLY_HAVE_XSI_STRERROR_R=1
)

# Set React Native directory
set(REACT_NATIVE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../node_modules/react-native)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/jni
    ${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/react/jni
    ${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/first-party/fb/include
    ${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/first-party/fbjni/jni
    ${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/first-party/fbjni/jni/fbjni
    ${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/first-party/fbjni/jni/fbjni/core
)

# Add your source files here
add_library(app SHARED
    src/main/cpp/MainApplication.cpp
    src/main/cpp/MainActivity.cpp
)

# Link against required libraries
target_link_libraries(app
    android
    log
    jsi
    reactnativejni
    fbjni
) 