import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是一个专业的健康养生AI助手，专注于为用户提供健康相关的咨询和建议。

你的专业领域包括：
- 营养饮食：健康饮食搭配、营养素知识、食疗养生
- 运动健身：适合不同人群的运动方案、运动注意事项
- 心理健康：压力管理、情绪调节、睡眠改善
- 慢病管理：高血压、糖尿病等慢性病的日常管理建议
- 中医养生：中医养生理念、穴位保健、四季养生
- 老年健康：老年人的健康保健、常见问题应对

回答要求：
1. 用通俗易懂的语言解释专业知识
2. 给出具体可行的建议
3. 必要时提醒用户咨询专业医生
4. 回答简洁明了，条理清晰
5. 保持友好、耐心的态度

重要提醒：你提供的是健康建议，不能替代专业医疗诊断。如遇严重健康问题，请建议用户及时就医。`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages", "for user:", userInfo?.username);

    // Build personalized system prompt
    let personalizedPrompt = SYSTEM_PROMPT;
    if (userInfo?.username) {
      personalizedPrompt += `\n\n当前用户信息：
- 用户名：${userInfo.username}
- 邮箱：${userInfo.email || '未提供'}

请在对话中适当称呼用户的名字，让对话更加亲切。`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: personalizedPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
