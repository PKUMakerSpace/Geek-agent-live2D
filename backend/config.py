import os
class Config:
    ''' LLM配置 '''
    LLM_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    LLM_API_KEY = os.getenv("DASHSCOPE_API_KEY")
    LLM_MODEL = "qwen-plus"  # 新增LLM模型配置
    
    ''' 向量模型配置 '''
    EMBEDDING_API_KEY = os.getenv("DASHSCOPE_API_KEY")
    EMBEDDING_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-embeddings/embeddings"
    EMBEDDING_MODEL = "text-embedding-v3"
    EMBEDDING_DIMENSION = 1024  # 推荐使用更高维度
    
    ''' 
        TTS服务配置
        TTS使用了Fish Audio的API，需要注册账号并获取API Key
        https://fish.audio/zh-CN/
        如果不想使用TTS，可以把FISH_API_KEY设置为空字符串
    '''
    FISH_API_KEY = ""
    FISH_REFERENCE_ID = "de00397ed7f6477a8763a0d436ece815" #芙宁娜
    
    ''' 对话历史配置 '''
    MAX_TURNS = 20  # 最多保存20轮对话，超过后自动归档一半
    
    @classmethod
    def is_tts_enabled(cls) -> bool:
        """判断是否启用TTS功能"""
        return bool(cls.FISH_API_KEY and cls.FISH_API_KEY.strip())
