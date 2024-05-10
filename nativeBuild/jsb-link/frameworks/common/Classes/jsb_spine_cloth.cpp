
#include "jsb_spine_cloth.h"

#if USE_SPINE > 0

#include "cocos/scripting/js-bindings/auto/jsb_cocos2dx_spine_auto.hpp"
#include "cocos/scripting/js-bindings/manual/jsb_spine_manual.hpp"
#include "cocos/scripting/js-bindings/manual/jsb_conversions.hpp"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "cocos/scripting/js-bindings/manual/jsb_global.h"
#include "cocos/scripting/js-bindings/manual/jsb_node.hpp"

#include "cocos/editor-support/spine-creator-support/AttachmentVertices.h"
#include "cocos/editor-support/spine-creator-support/spine-cocos2dx.h"
#include "cocos/editor-support/spine/spine.h"

#include "cocos/editor-support/middleware-adapter.h"
#include "cocos/editor-support/spine-creator-support/SkeletonDataMgr.h"
#include "cocos/editor-support/spine-creator-support/SkeletonRenderer.h"
#include "cocos/editor-support/spine-creator-support/spine-cocos2dx.h"


using namespace cocos2d;

static bool js_register_spine_updateRegion(se::State& s) {
    const auto& args = s.args();
    int argc = (int)args.size();
    if (argc != 2) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", argc, 1);
        return false;
    }
    bool ok = false;

    spine::Attachment* arg0 = nullptr;
    ok &= seval_to_native_ptr(args[0], &arg0);

    middleware::Texture2D* texture = nullptr;
    ok &= seval_to_native_ptr(args[1], &texture);

    spine::RegionAttachment* attachment = (spine::RegionAttachment*) arg0;
    float wide = texture->getPixelsWide();
    float high = texture->getPixelsHigh();

    attachment->setUVs(0, 0, 1, 1, false);
    attachment->setRegionWidth(wide);
    attachment->setRegionHeight(high);
    attachment->setRegionOriginalWidth(wide);
    attachment->setRegionOriginalHeight(high);
    attachment->setWidth(wide);
    attachment->setHeight(high);

    spine::AttachmentVertices* attachV = (spine::AttachmentVertices*)attachment->getRendererObject();
    if (attachV->_texture == texture) {
        return true;
    }
    CC_SAFE_RELEASE(attachV->_texture);
    attachV->_texture = texture;
    CC_SAFE_RETAIN(texture);

    middleware::V2F_T2F_C4B* vertices = attachV->_triangles->verts;
    for (int i = 0, ii = 0; i < 4; ++i, ii += 2) {
        vertices[i].texCoord.u = attachment->getUVs()[ii];
        vertices[i].texCoord.v = attachment->getUVs()[ii + 1];
    }

    attachment->updateOffset();
    return true;
}
SE_BIND_FUNC(js_register_spine_updateRegion)

bool register_all_spine_cloth(se::Object* obj) {
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("spine", &nsVal)) {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("spine", nsVal);
    }
    se::Object* ns = nsVal.toObject();

    ns->defineFunction("updateRegion", _SE(js_register_spine_updateRegion));
    se::ScriptEngine::getInstance()->clearException();

    return true;
}

#endif
