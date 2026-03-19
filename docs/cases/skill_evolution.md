case_id	ability_category	Case name	description	difficulty	Synthesize guidance
	这一case度量了哪(几)类能力？候选项：skill evolution / cross environment composition / proactive decision making / reflective diagnosis
1	skill evolution	skill_creation	识别交互历史中的模式，从头创建SKILL	E	评价agent识别交互历史中的模式，从头创建SKILL的能力 （从示例到规则，从头归纳）
2	skill evolution	skill_supplementation	根据交互历史，补充更新现有SKILL	E	评价agent结合已有SKILL与交互历史，更新自身技能的能力（自我迭代已有知识）
3	skill evolution	skill_conflict_resolvation	根据交互历史，更新现有SKILL： 识别冲突内容、识别旧版本SKILL中可能存在的误导性内容，并加以更新	M	评价agent结合已有SKILL与交互历史，更新自身技能的能力（自我迭代已有知识）
4	skill evolution	skill_repository_curation	整理现有SKILL库，合并冗余、去除失效SKILL	H	评价agent管理已有SKILL的能力（对于SKILL系统的meta认知）
5	skill evolution	skill_dependency_fix	用户指令底层skill修改后，能否准确识别上层skill对于底层skill的调用关系，并理顺上层skill对底层skill的调用	H	评价模型理解存在较复杂嵌套结构SKILL，并加以更新的能力
