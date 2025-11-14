/**
 * Seed script for tencoreSkills table
 * Populates the ten core skills (傅家俊台球十大招) with detailed content
 */

import { db } from "../server/db.js";
import { tencoreSkills } from "../shared/schema.js";

const TENCORE_SKILLS_DATA = [
  {
    id: "skill_1",
    name: "第一招：基本功",
    skillOrder: 1,
    icon: "basics.svg",
    description: "基本功是所有台球技术的基石，其稳定性和正确性直接决定了球员的上限。",
    objectives: [
      "建立稳固、可重复的击球动作",
      "掌握正确的站位、握杆和手架",
      "形成平顺、具有穿透力的发力方式",
    ],
    detailedContent: {
      coreIdea: "通过对动作和出杆两大模块的训练，建立一套扎实、稳定、可重复的击球动作。",
      modules: [
        {
          title: "模块一：动作 (Stance & Posture)",
          elements: [
            {
              name: "手架 (Bridge)",
              goal: "为球杆提供稳固支撑",
              technique: "手掌紧贴台面，手指用力扒住台布，形成牢固三角支撑；根据击球点调整高度和距离（通常20-30cm）。",
              commonIssues: "手架不稳、手指无力、距离母球过远或过近"
            },
            {
              name: "握杆 (Grip)",
              goal: "以放松、自然的方式控制球杆",
              technique: "握在重心点后方约10-20cm处；主要依靠后三指和虎口，力度要松，发力瞬间才收紧。",
              commonIssues: "握杆过紧、位置错误、全手掌握死"
            },
            {
              name: "入位 (Approach)",
              goal: "进入最舒适、稳定的准备姿势",
              technique: "从目标球和袋口的延长线反向找到击球线；右脚踩线，身体侧向进入；从髋部俯身，保持脊柱挺直。",
              commonIssues: "站位偏离击球线、弯腰驼背、身体不稳"
            },
            {
              name: "姿势 (Posture)",
              goal: "形成稳固的击球姿势",
              technique: "头部稳定，双眼、下巴、球杆、击球线在同一垂直平面；上半身与台面接近平行；支撑腿伸直或微曲。",
              commonIssues: "头部晃动、身体僵硬、重心不稳"
            }
          ]
        },
        {
          title: "模块二：出杆 (Cue Action)",
          elements: [
            {
              name: "定点 (Aiming Point)",
              goal: "在运杆前做最后确认",
              technique: "杆头在预想的击打点上停留1-2秒，进行最终瞄准确认。",
              commonIssues: "定点不准、停留时间过短"
            },
            {
              name: "运杆 (Cueing)",
              goal: "为最终发力做准备",
              technique: "节奏前慢后快，由小到大（通常2-3次）；确保球杆在击球线上水平、直线地运动。",
              commonIssues: "运杆不直、节奏混乱、幅度过小"
            },
            {
              name: "后停 (Back Pause)",
              goal: "再次确认目标和稳定身体",
              technique: "在最后一次运杆后摆到最高点时，有一个约0.5-1秒的短暂的停顿。",
              commonIssues: "没有后停直接出杆，导致动作仓促、发力不稳"
            },
            {
              name: "出杆 (Delivery)",
              goal: "将力量平顺、加速地传递给母球",
              technique: "出杆过程是持续加速的过程；击球后有自然的向前延伸（Follow-through）；出杆完成后身体和头部保持静止。",
              commonIssues: "出杆后立即抬头、动作变形、发力过猛"
            }
          ]
        }
      ],
      keyPrinciple: "将击球想象成'用杆头把母球推出去'，而不是'打'或'砸'。这有助于形成更平顺、更具穿透力的发力方式。"
    }
  },
  {
    id: "skill_2",
    name: "第二招：发力",
    skillOrder: 2,
    icon: "power.svg",
    description: "发力并非单纯的力量大小，而是用最小的力量和最短的杆法，打出最有效的动能。",
    objectives: [
      "掌握打、点、推、搓四种发力方式",
      "精确控制击球力量大小",
      "提高准度稳定性和母球走位控制力",
    ],
    detailedContent: {
      coreIdea: "让母球高效转动起来，提高准度的稳定性和对母球走位的控制力。",
      fourMethods: [
        {
          name: "打 (Stroke)",
          definition: "小臂带动，手腕速度快于小臂，强调爆发力和穿透力。出杆长，加速充分。",
          timing: "击球前",
          usage: "中等或中等偏大的力量，适用于大范围走位"
        },
        {
          name: "点 (Stun)",
          definition: "瞬间触碰，杆头接触白球前瞬间加速，然后手后手轻抓杆头，击球后马上停止送杆。",
          timing: "触球瞬间",
          usage: "中力或中等偏下的力量，多用于击打中心点以下的位置，适用于小范围走位"
        },
        {
          name: "推 (Push)",
          definition: "小臂带动，手腕顺势将球杆推出，匀速出杆。杆头轻柔触碰白球，有少量延伸。",
          timing: "击球后",
          usage: "中力或中等偏下的力量，可以适用于白球任何位置的打点，可以精准控制落点"
        },
        {
          name: "搓 (Screw)",
          definition: "类似低杆减速刹车的打法，出杆快，击打到白球后马上收住。力量是匀加速的。",
          timing: "触球瞬间",
          usage: "中力或中等偏小力量，用于白球和目标球距离较远，角度较大，想让白球分离距离更短时"
        }
      ],
      powerControl: {
        definition: "根据走位需求，精确控制击球的力量大小",
        levels: ["大力（长距离走位）", "中力（中距离或复杂局面）", "小力（近距离微调）"],
        training: "通过固定的摆球，反复练习用不同力量将母球走到指定区域，形成肌肉记忆"
      }
    }
  },
  {
    id: "skill_3",
    name: "第三招：高效五分点",
    skillOrder: 3,
    icon: "five-point.svg",
    description: "承上启下的关键招式，是检测学员基本功和发力稳定性的核心方式。",
    objectives: [
      "巩固基本功和发力技术",
      "体会不同发力方式的差异",
      "诊断和纠正技术问题",
    ],
    detailedContent: {
      coreIdea: "不仅是巩固第一招和第二招的试金石，更是开启第四招准度和第五招杆法的基础。",
      trainingMethod: {
        definition: "将母球放置于开球线上，目标球放置于球桌的正中心，反复连续击打直线球进底袋的训练。",
        core: "清楚知道自己的练习内容是什么，而不是以进球为目的盲目练习。重点在于体会每一个阶段的注意力重心。",
        steps: [
          "从半台直线球和中力定杆开始，放低难度，体会节奏",
          "熟练掌握各种发力方式（打、点、推、搓）",
          "结合杆法组合（高、中、低杆）进行训练",
          "逐步增加距离，从半台到中台，最终到五分点距离"
        ]
      },
      diagnostics: [
        {
          problem: "入位误差",
          symptom: "入位时感觉球杆是直的，但出杆后偏左或偏右",
          solution: "在袋口观察学员入位情况，检查球杆、杆尾与进球线是否一致"
        },
        {
          problem: "视觉误差",
          symptom: "感觉瞄在中心点，实际瞄在了左塞或右塞",
          solution: "在袋口观察学员入位情况，检查球杆皮头是否瞄准白球中心点"
        },
        {
          problem: "出杆误差",
          symptom: "运杆时感觉是直的，但出杆瞬间打偏",
          solution: "加强学员运杆出杆练习，保证球杆的平直顺畅"
        },
        {
          problem: "身体控制",
          symptom: "运杆、出杆时身体或头部晃动",
          solution: "加强入位站姿练习，回杆出杆练习，做到出杆时身体放松"
        },
        {
          problem: "节奏控制",
          symptom: "节奏忽快忽慢，进球不稳定",
          solution: "加强节奏练习，稳定出杆节奏，做到四停两慢，节奏一致"
        }
      ]
    }
  },
  {
    id: "skill_4",
    name: "第四招：准度",
    skillOrder: 4,
    icon: "accuracy.svg",
    description: "准度分为瞄准的准确性和打准的准确性。对初学者，打准比瞄准更重要。",
    objectives: [
      "掌握瞄准原理和常用瞄准方法",
      "提高打准的稳定性",
      "在不同角度和距离下精确进球",
    ],
    detailedContent: {
      coreIdea: "找到最佳进球点（瞄准的准确性）+ 入位和击打点的准确性（打准的准确性）",
      aimingPrinciple: {
        fourPoints: ["袋口点", "进球点（假想球中心点）", "撞击点", "击打点"],
        twoLines: ["进球线（进球点↔袋口点）", "击球线（击打点↔进球点）"]
      },
      aimingMethods: [
        {
          name: "点位重合法",
          content: "球上找点，将母球与目标球瞄准击点",
          range: "15°内小角度"
        },
        {
          name: "体积重厚法",
          content: "球体切片，根据角度大小判断两球重叠厚度",
          range: "45°内中等角度"
        },
        {
          name: "翘尾巴法",
          content: "台呢找点，将球杆往右平移击球的轨迹",
          range: "大角度"
        },
        {
          name: "击球延长线法",
          content: "库边找点，根据进球线延长线在库边找点",
          range: "远台、半贴库球、30度以内"
        }
      ],
      training: [
        "固定白球，移动目标球：练习和熟悉不同角度的瞄准点",
        "固定目标球，移动白球：练习在不同母球位置下，对同个目标球的线路处理和杆法控制能力"
      ]
    }
  },
  {
    id: "skill_5",
    name: "第五招：杆法",
    skillOrder: 5,
    icon: "cue-technique.svg",
    description: "杆法是为了控制母球行进方向而调整击打母球点位和调整球杆角度的方法。",
    objectives: [
      "掌握高、中、低杆等基础杆法",
      "理解和应用加塞技术",
      "实现精确走位控制",
    ],
    detailedContent: {
      coreIdea: "是实现精确走位的核心技术",
      basicCueTech: [
        {
          name: "高杆",
          feature: "跟随，分离角最小",
          technique: "提高手架，出杆延伸长，皮头下压黏球"
        },
        {
          name: "中杆",
          feature: "分离角为90°",
          technique: "出杆长，速度适中，根据距离调整力度和打点"
        },
        {
          name: "低杆",
          feature: "回旋，分离角最大",
          technique: "手架放平，后手压低，杆头方向朝下，延伸长"
        },
        {
          name: "定杆",
          feature: "白球定住不动",
          technique: "打点匹配力度，使白球在撞击时无旋转"
        },
        {
          name: "小低杆",
          feature: "小力的低杆，白球沿90°，减少滑行距离",
          technique: "短快拔出，蜻蜓点水，手腕放松，延伸短"
        }
      ],
      advancedTech: {
        stun: "通过在中高杆、中杆、中低杆中加入刹车的动作，精确控制母球分离后的微小距离",
        jump: "通过立起球杆，让母球跳过或绕过障碍球",
        sideSpin: {
          forward: "顺塞：增大吃库后的反射角，白球走速快",
          reverse: "反塞：减小吃库后的反射角，白球走位变慢、柔顺"
        }
      }
    }
  },
  {
    id: "skill_6",
    name: "第六招：分离角",
    skillOrder: 6,
    icon: "separation-angle.svg",
    description: "母球在和目标球相撞之后，母球行进路线与目标球行进路线之间的夹角。",
    objectives: [
      "理解90度法则",
      "掌握杆法对分离角的影响",
      "精确控制母球走位方向",
    ],
    detailedContent: {
      coreIdea: "理解和掌握分离角是实现精确走位的前提",
      principle: {
        ninetyDegree: "在不考虑旋转和摩擦的情况下，任何杆法的初始分离角都是90度",
        cueTechEffect: {
          high: "高杆：使母球向前旋转，分离角 < 90度",
          mid: "中杆：母球无旋转，分离角 = 90度",
          low: "低杆：使母球向后旋转，分离角 > 90度"
        }
      },
      fourFactors: [
        "力度：力度越大，分离角越大",
        "打点：打点越高，分离角越小；打点越低，分离角越大",
        "角度：角度越小，高杆分离角越小，低杆分离角越大；角度越大则相反",
        "距离：距离越远，要打出同样的分离角，所需匹配的力量越大，打点也需要相应调整"
      ]
    }
  },
  {
    id: "skill_7",
    name: "第七招：走位",
    skillOrder: 7,
    icon: "positioning.svg",
    description: "击球后，让母球或目标球按照意愿运动到所需位置，为下一杆创造便利。",
    objectives: [
      "掌握点、线、面三层次走位",
      "熟练运用一库、两库、多库走位",
      "提高连续进攻能力",
    ],
    detailedContent: {
      coreIdea: "是衡量球员综合实力的重要标准",
      threeLevels: [
        {
          name: "点走位",
          definition: "将母球精确控制在一个手摆位的范围",
          core: "精确控制",
          usage: "近距离、有障碍球时"
        },
        {
          name: "线走位",
          definition: "控制母球的行进路线与目标球进球线大致平行",
          core: "路线控制",
          usage: "半台、一库走位"
        },
        {
          name: "面走位",
          definition: "将母球控制在一个较大的目标区域内",
          core: "区域控制",
          usage: "长距离、多库、开球、防守"
        }
      ],
      training: [
        "不吃库走位：练习对力量和杆法的精准控制",
        "一库走位：最常用的走位方式，练习利用一次库边反弹",
        "两库/多库走位：学习复杂的线路规划，用于K球、防守或处理复杂局面"
      ]
    }
  },
  {
    id: "skill_8",
    name: "第八招：轻松清蛇彩",
    skillOrder: 8,
    icon: "snake.svg",
    description: "清蛇彩是连续进球能力的集中体现，培养连续进攻能力、走位规划能力和高压下的稳定性。",
    objectives: [
      "掌握基础蛇彩训练方法",
      "提高连续进球能力",
      "培养全局规划能力",
    ],
    detailedContent: {
      coreIdea: "通过不同难度的蛇彩训练，培养球员的连续进攻能力、走位规划能力和高压下的稳定性",
      trainingModules: [
        {
          category: "基础蛇彩",
          content: "从蛇彩一到三、中袋四球开始，练习简单的走位和击球节奏"
        },
        {
          category: "线路规划",
          content: "长台蛇彩、横台蛇彩、L形蛇彩、矩阵蛇彩，综合考验全局规划能力"
        }
      ]
    }
  },
  {
    id: "skill_9",
    name: "第九招：技能",
    skillOrder: 9,
    icon: "skills.svg",
    description: "掌握各种高级击球技能，是解决实战中复杂、困难局面的关键。",
    objectives: [
      "掌握开球、跳球、翻袋等高级技能",
      "学会解球和防守技巧",
      "在实战中灵活运用各种技能",
    ],
    detailedContent: {
      coreIdea: "能让你创造出意想不到的机会",
      coreSkills: [
        "开球 (Break)",
        "跳球 (Jump Shot)",
        "翻袋 (Bank Shot)",
        "架杆 (Mechanical Bridge)",
        "解球 (Safety Escape)",
        "传球 (Combination Shot)",
        "借下 (Kiss Shot)",
        "克拉克 (Carom Shot)",
        "贴球 (Frozen Ball)"
      ]
    }
  },
  {
    id: "skill_10",
    name: "第十招：思路",
    skillOrder: 10,
    icon: "strategy.svg",
    description: "台球不仅是技术的比拼，更是思维和心态的较量。",
    objectives: [
      "培养全局观和战术策略",
      "掌握攻防转换时机",
      "锻炼强大的比赛心态",
    ],
    detailedContent: {
      coreIdea: "从一个打球的转变为一个会比赛的",
      thinkingModules: [
        {
          module: "进攻思路",
          content: "局面分析（评估球形、找关键球、规划线路）和局面处理（选择最优清台路线）"
        },
        {
          module: "防守思路",
          content: "攻防转换（判断何时进攻、何时防守）和防守套路（做斯诺克、沉底、控制球权）"
        },
        {
          module: "心态调整",
          content: "通过球型训练、对抗和比赛，积累经验，锻炼强大的比赛心态"
        }
      ]
    }
  }
];

async function seedTencoreSkills() {
  console.log("🎱 Starting to seed tencore skills data...");

  try {
    // Delete existing data
    console.log("🗑️  Cleaning existing tencore skills data...");
    await db.delete(tencoreSkills);

    // Insert new data
    console.log("📝 Inserting tencore skills data...");
    for (const skill of TENCORE_SKILLS_DATA) {
      await db.insert(tencoreSkills).values(skill);
      console.log(`✅ Inserted: ${skill.name}`);
    }

    console.log("🎉 Successfully seeded all tencore skills!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding tencore skills:", error);
    process.exit(1);
  }
}

// Run the seed function
seedTencoreSkills();
