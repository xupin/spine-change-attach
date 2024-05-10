const { ccclass, property } = cc._decorator;

@ccclass("SkelChanger")
export default class SkelChanger extends cc.Component {
	start() {
		// @ts-ignore
		let skeleton = sp.Skeleton.prototype;
		if (CC_JSB) {
			// 局部换装
			// @ts-ignore
			skeleton.updateRegion = function (attach: sp.spine.RegionAttachment | sp.spine.MeshAttachment, tex2d: cc.Texture2D) {
				// @ts-ignore
				let jsbTex2d = new middleware.Texture2D();
				jsbTex2d.setNativeTexture(tex2d.getImpl());
				jsbTex2d.setPixelsWide(tex2d.width);
				jsbTex2d.setPixelsHigh(tex2d.height);

				// @ts-ignore
				sp.spine.updateRegion(attach, jsbTex2d);
			};
		} else {
			// 局部换装
			// @ts-ignore
			skeleton.updateRegion = function (attach: sp.spine.RegionAttachment | sp.spine.MeshAttachment, tex2d: cc.Texture2D) {
				// @ts-ignore
				const skeTexture = new sp.SkeletonTexture({ width: tex2d.width, height: tex2d.height } as ImageBitmap);
				skeTexture.setRealTexture(tex2d);

				const region: sp.spine.TextureAtlasRegion = attach.region as sp.spine.TextureAtlasRegion;
				region.width = tex2d.width;
				region.height = tex2d.height;
				region.originalWidth = tex2d.width;
				region.originalHeight = tex2d.height;
				region.rotate = false;
				region.u = 0;
				region.v = 0;
				region.u2 = 1;
				region.v2 = 1;
				region.texture = skeTexture;
				region.renderObject = region;

				attach.region = region;
				attach.width = tex2d.width;
				attach.height = tex2d.height;

				if (attach instanceof sp.spine.MeshAttachment) {
					attach.updateUVs();
				} else {
					attach.setRegion(region);
					attach.updateOffset();
				}
			};
		}
	}

	private async deepCopy(skel: sp.Skeleton) {
		// 记录当前播放的动画
		const animation = skel.animation;
		const skelData = skel.skeletonData;
		const flag = "_copy";
		// @ts-ignore
		if (skelData._uuid !== undefined && skelData._uuid.indexOf(flag) !== -1) {
			cc.log("说明已经拷贝过了");
			return;
		}
		let copy: sp.SkeletonData = new sp.SkeletonData();
		cc.js.mixin(copy, skelData);
		const oldName: string = copy.name;
		const newName: string = copy.name + flag;

		const date = new Date();
		// @ts-ignore
		copy._uuid = skelData._uuid + "_" + date.getTime() + flag;
		copy.name = newName;
		copy.atlasText = copy.atlasText.replace(oldName, newName);
		// @ts-ignore
		copy.textureNames[0] = newName + ".png";
		// @ts-ignore
		copy.init && copy.init();

		skel.skeletonData = copy;
		// 继续播放的动画，不然会停止
		skel.setAnimation(0, animation, true);
	}

	protected async updateAttach(skel: sp.Skeleton, slotName: string, texture2d: cc.Texture2D) {
		this.deepCopy(skel);

		const slot: sp.spine.Slot = skel!.findSlot(slotName);
		if (!slot) {
			cc.error("findSlot is null");
			return;
		}

		const attach: sp.spine.RegionAttachment | sp.spine.MeshAttachment = slot.getAttachment() as
			| sp.spine.RegionAttachment
			| sp.spine.MeshAttachment;
		if (attach === null) {
			cc.error("getAttachment is null");
			return;
		}

		// @ts-ignore
		skel.updateRegion(attach, texture2d);
		skel.invalidAnimationCache();
	}
}
