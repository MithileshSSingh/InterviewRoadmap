const androidPhase7 = {
  id: "phase-7",
  title: "Phase 7: Android + Backend Integration",
  emoji: "🔌",
  description: "Master API design, security, authentication, pagination, and backend integration patterns for production Android apps.",
  topics: [
    {
      id: "api-contract-design",
      title: "API Contract Design & Versioning",
      explanation: `**API contract design** defines how your Android app communicates with backend services. At the senior level, you're expected to design and review API contracts, not just consume them.

**RESTful API best practices for mobile:**
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Consistent naming: \`/users/{id}/posts\` not \`/getUserPosts?userId=123\`
- Return appropriate status codes (200, 201, 400, 401, 404, 500)
- Include pagination metadata in list responses
- Use ISO 8601 for dates, UTC timezone

**API versioning strategies:**
1. **URL versioning:** \`/v1/users\`, \`/v2/users\` — Clearest, most common
2. **Header versioning:** \`Accept: application/vnd.api.v2+json\` — Cleaner URLs
3. **Query parameter:** \`/users?version=2\` — Easy but pollutes params

**Request/Response best practices:**
- Wrap responses in an envelope: \`{ "data": {...}, "meta": {...}, "errors": [...] }\`
- Use consistent error format: \`{ "code": "USER_NOT_FOUND", "message": "...", "details": {...} }\`
- Keep responses flat — avoid deeply nested objects for mobile bandwidth efficiency
- Include only needed fields — consider GraphQL or field selection (\`?fields=id,name,email\`)`,
      codeExample: `// Retrofit API definition — clean contract
interface UserApi {
    @GET("v1/users/{id}")
    suspend fun getUser(@Path("id") id: String): ApiResponse<UserDto>
    
    @GET("v1/users/{id}/posts")
    suspend fun getUserPosts(
        @Path("id") userId: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("sort") sort: String = "created_at:desc"
    ): PaginatedResponse<PostDto>
    
    @POST("v1/users")
    suspend fun createUser(@Body request: CreateUserRequest): ApiResponse<UserDto>
    
    @PATCH("v1/users/{id}")
    suspend fun updateUser(
        @Path("id") id: String,
        @Body request: UpdateUserRequest
    ): ApiResponse<UserDto>
}

// Standardized API response wrapper
data class ApiResponse<T>(
    val data: T,
    val meta: Meta? = null
)

data class PaginatedResponse<T>(
    val data: List<T>,
    val pagination: Pagination
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val totalPages: Int,
    val totalItems: Int,
    val hasNext: Boolean
)

// Error response handling
data class ApiError(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null
)

// Centralized error handling interceptor
class ErrorInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())
        if (!response.isSuccessful) {
            val errorBody = response.body?.string()
            val apiError = try {
                Json.decodeFromString<ApiError>(errorBody ?: "")
            } catch (e: Exception) {
                ApiError("UNKNOWN", "HTTP \${response.code}")
            }
            throw ApiException(response.code, apiError)
        }
        return response
    }
}

class ApiException(val httpCode: Int, val error: ApiError) : Exception(error.message)`,
      exercise: `**Practice:**
1. Design a RESTful API contract for a note-taking app with CRUD operations
2. Implement a Retrofit interceptor that adds authorization headers and handles 401 errors
3. Create a standardized error handling pipeline from API error to UI message
4. Design an API versioning strategy for a 3-year-old app with 5M users
5. Compare REST vs GraphQL for mobile — when would you choose each?`,
      commonMistakes: [
        "Not versioning APIs from the start — forced breaking changes affect all users simultaneously",
        "Returning different error formats for different endpoints — inconsistency makes error handling complex",
        "Over-fetching data — returning 50 fields when the mobile app needs 5 wastes bandwidth",
        "Not including pagination for list endpoints — mobile apps must handle large datasets efficiently",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you design API contracts that work well for both mobile and web clients?",
          a: "**Strategy:** (1) Use field selection (/users?fields=id,name,avatar) so mobile fetches less data than web. (2) Provide aggregate endpoints for mobile (/dashboard returns combined data that web fetches separately). (3) Use response compression (gzip) — more important for mobile. (4) Design for offline — include ETags for cache validation, timestamps for delta sync. (5) Consider BFF (Backend For Frontend) — a mobile-specific API layer that aggregates backend microservices. (6) Use pagination with cursor-based approach (not offset) for infinite scroll."
        },
      ],
    },
    {
      id: "pagination-strategies",
      title: "Pagination Strategies",
      explanation: `**Pagination** is essential for loading large datasets efficiently on mobile. The Paging 3 library is Google's recommended solution for Android.

**Pagination types:**
1. **Offset-based:** \`?page=3&limit=20\` → Simple but problematic with live data (inserts cause duplicates/skips)
2. **Cursor-based:** \`?after=cursor123&limit=20\` → Reliable for live data, no duplicates
3. **Keyset-based:** \`?after_id=456&limit=20\` → Similar to cursor but uses a data field as cursor

**Paging 3 architecture:**
\`\`\`
PagingSource (data loading) → Pager → PagingData<T> → LazyColumn/RecyclerView
                                ↑
                         PagingConfig (pageSize, prefetchDistance)
\`\`\`

**Key components:**
- **PagingSource:** Loads pages of data from a single source (network or DB)
- **RemoteMediator:** Loads from network AND saves to DB (offline-first paging)
- **Pager:** Creates the PagingData stream
- **PagingConfig:** Controls page size, prefetch, initial load
- **cachedIn(viewModelScope):** Caches paging data across config changes`,
      codeExample: `// Paging 3 — Network-only PagingSource
class ArticlePagingSource(
    private val api: ArticleApi,
    private val query: String
) : PagingSource<Int, Article>() {
    
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Article> {
        val page = params.key ?: 1
        return try {
            val response = api.searchArticles(query, page, params.loadSize)
            LoadResult.Page(
                data = response.data.map { it.toDomain() },
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (response.pagination.hasNext) page + 1 else null
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
    
    override fun getRefreshKey(state: PagingState<Int, Article>): Int? {
        return state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(pos)?.nextKey?.minus(1)
        }
    }
}

// ViewModel with Paging
@HiltViewModel
class ArticleViewModel @Inject constructor(
    private val api: ArticleApi
) : ViewModel() {
    
    private val _query = MutableStateFlow("")
    
    val articles: Flow<PagingData<Article>> = _query
        .debounce(300)
        .flatMapLatest { query ->
            Pager(
                config = PagingConfig(
                    pageSize = 20,
                    prefetchDistance = 5,
                    initialLoadSize = 40
                ),
                pagingSourceFactory = { ArticlePagingSource(api, query) }
            ).flow
        }
        .cachedIn(viewModelScope)
    
    fun search(query: String) { _query.value = query }
}

// Compose UI with Paging
@Composable
fun ArticleList(viewModel: ArticleViewModel = hiltViewModel()) {
    val articles = viewModel.articles.collectAsLazyPagingItems()
    
    LazyColumn {
        items(articles.itemCount) { index ->
            articles[index]?.let { article ->
                ArticleRow(article)
            }
        }
        
        // Loading indicator
        when (articles.loadState.append) {
            is LoadState.Loading -> item { CircularProgressIndicator() }
            is LoadState.Error -> item {
                RetryButton { articles.retry() }
            }
            else -> {}
        }
    }
}`,
      exercise: `**Practice:**
1. Implement a PagingSource for cursor-based pagination
2. Add a RemoteMediator for offline-first paging with Room
3. Handle empty states, loading, and error states in paged lists
4. Implement pull-to-refresh with Paging 3
5. Compare offset vs cursor pagination — when does offset break?`,
      commonMistakes: [
        "Using offset pagination with live data — new items push existing items to next page, causing duplicates or skips",
        "Not using cachedIn(viewModelScope) — paging data is lost on configuration change",
        "Setting pageSize too small — many small network requests are worse than fewer larger ones",
        "Not implementing getRefreshKey — pull-to-refresh doesn't scroll to the right position",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is cursor-based pagination better than offset-based for mobile apps?",
          a: "Offset pagination uses `OFFSET n LIMIT m` which has issues: (1) If a new item is inserted at the top while you're on page 3, a previous item shifts to page 4 and appears as a duplicate when you load the next page. (2) Large offsets are slow in databases (must scan and skip n rows). Cursor-based uses a unique, ordered field (like an ID or timestamp) as a bookmark: `WHERE id > last_seen_id LIMIT 20`. This is (1) stable — insertions don't affect subsequent pages, (2) performant — uses index-based seeks, not offset scans, (3) reliable for infinite scroll on mobile."
        },
      ],
    },
    {
      id: "security-auth-encryption",
      title: "Security: OAuth, Tokens & Encryption",
      explanation: `**Mobile security** is a critical topic for senior Android developers. Google expects you to understand authentication flows, secure key storage, and network security at a deep level.

**OAuth 2.0 + PKCE flow for mobile:**
\`\`\`
1. App generates code_verifier (random) + code_challenge (SHA256 hash)
2. App opens browser with auth URL + code_challenge
3. User authenticates in browser
4. Server redirects back to app with authorization code
5. App exchanges code + code_verifier for access_token + refresh_token
6. App uses access_token for API calls
7. When token expires, use refresh_token to get new access_token
\`\`\`
**PKCE (Proof Key for Code Exchange)** prevents authorization code interception — essential for mobile apps where you can't safely store a client secret.

**Token storage:**
- Use **EncryptedSharedPreferences** or Android **Keystore** for tokens
- NEVER store tokens in plain SharedPreferences or logs
- Clear tokens on logout

**Certificate pinning:** Prevents man-in-the-middle attacks by verifying the server's certificate matches a known hash. OkHttp supports this natively.

**Network security config (Android 9+):**
- Cleartext traffic blocked by default
- Custom trust anchors per domain
- Debug-only CA certificates for testing with proxies`,
      codeExample: `// OAuth 2.0 token management
class AuthManager @Inject constructor(
    private val tokenStorage: TokenStorage,
    private val authApi: AuthApi
) {
    suspend fun getValidAccessToken(): String {
        val currentToken = tokenStorage.getAccessToken()
        if (currentToken != null && !isExpired(currentToken)) {
            return currentToken.value
        }
        return refreshToken()
    }
    
    private suspend fun refreshToken(): String {
        val refreshToken = tokenStorage.getRefreshToken()
            ?: throw AuthException("No refresh token — re-login required")
        val response = authApi.refreshToken(
            RefreshTokenRequest(refreshToken = refreshToken)
        )
        tokenStorage.saveTokens(response.accessToken, response.refreshToken)
        return response.accessToken
    }
}

// OkHttp interceptor for automatic token injection + refresh
class AuthInterceptor @Inject constructor(
    private val authManager: AuthManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { authManager.getValidAccessToken() }
        val request = chain.request().newBuilder()
            .header("Authorization", "Bearer \$token")
            .build()
        val response = chain.proceed(request)
        
        if (response.code == 401) {
            response.close()
            // Token expired mid-flight — refresh and retry
            val newToken = runBlocking { authManager.refreshToken() }
            val newRequest = chain.request().newBuilder()
                .header("Authorization", "Bearer \$newToken")
                .build()
            return chain.proceed(newRequest)
        }
        return response
    }
}

// Certificate pinning with OkHttp
val client = OkHttpClient.Builder()
    .certificatePinner(
        CertificatePinner.Builder()
            .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .add("api.example.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=") // Backup pin
            .build()
    )
    .build()

// Encrypted token storage
class TokenStorage @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = EncryptedSharedPreferences.create(
        "secure_prefs",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveTokens(access: String, refresh: String) {
        prefs.edit()
            .putString("access_token", access)
            .putString("refresh_token", refresh)
            .apply()
    }
    
    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun getRefreshToken(): String? = prefs.getString("refresh_token", null)
    fun clearTokens() { prefs.edit().clear().apply() }
}`,
      exercise: `**Practice:**
1. Implement OAuth 2.0 + PKCE login flow using AppAuth library
2. Create an OkHttp Authenticator that handles token refresh without racing
3. Set up certificate pinning with a backup pin
4. Implement EncryptedSharedPreferences for secure token storage
5. Configure network_security_config.xml for your production and debug environments`,
      commonMistakes: [
        "Storing tokens in plain SharedPreferences — easily extractable on rooted devices",
        "Not implementing token refresh — users get logged out when access token expires",
        "Using a single certificate pin without backup — certificate rotation will break your app",
        "Running OAuth flow in a WebView instead of Custom Tabs — WebView can intercept credentials",
        "Logging access tokens — accidental token exposure in logcat/crash reports",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the OAuth 2.0 + PKCE flow for mobile apps. Why is PKCE necessary?",
          a: "PKCE (Proof Key for Code Exchange) solves a fundamental mobile security problem: mobile apps can't securely store a client_secret (APKs can be decompiled). Without PKCE, an attacker could intercept the authorization code (via a malicious app registered for the same redirect URI) and exchange it for tokens. PKCE prevents this: the client generates a random code_verifier, sends its SHA256 hash (code_challenge) with the auth request. When exchanging the code, the client sends the original code_verifier. The server verifies the hash matches. An attacker who intercepts the code can't generate the correct code_verifier."
        },
        {
          type: "tricky",
          q: "How do you handle concurrent token refresh requests?",
          a: "Use a mutex/lock to ensure only one refresh happens at a time. Without this, multiple expired-token API calls trigger simultaneous refresh requests, causing race conditions (refresh token may be invalidated after first use). Implementation: Use `Mutex` from kotlinx.coroutines. The first caller acquires the lock and refreshes. Subsequent callers suspend until the lock is released, then use the new token. Alternative: OkHttp's Authenticator interface serializes authentication retries automatically."
        },
      ],
    },
  ],
};

export default androidPhase7;
