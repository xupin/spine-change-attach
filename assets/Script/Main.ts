import SkelChanger from "./spine/SkelChanger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends SkelChanger {
	@property(cc.Node)
	skelNode: cc.Node = null;

	onLoad() {
		const skel: sp.Skeleton = this.skelNode.getComponent(sp.Skeleton);
		skel.animation = "idle";
		skel.loop = true;

		cc.resources.load<cc.SpriteFrame>(`icon/icon_dayanta`, cc.SpriteFrame, (e: Error, asset: cc.SpriteFrame) => {
			if (e) {
				cc.error(e);
				return;
			}
			this.updateAttach(skel, "jiuhu_3", asset.getTexture());
		});
	}
}
