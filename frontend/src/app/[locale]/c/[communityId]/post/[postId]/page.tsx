'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Link as MuiLink,
  Avatar,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { enUS, fr, es } from 'date-fns/locale'; // Example locales

import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/contexts/VerificationContext';
import CommentItem, { CommentData as CommentDataType } from '@/components/CommentItem';
import { createLocalizedUrl } from '@/lib/routeUtils';

// Define interfaces (adapt based on actual API responses)
interface Author {
    id: string;
    real_name: string;
    // Add other relevant fields like avatar_url if available
}

interface CommunityRef {
    id: string;
    name: string;
}

interface PostData {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at?: string | null;
    author_id: string; // Assuming this is how author is linked
    community_id: string;
    // Joined data (adjust based on actual API)
    author: Author; 
    community: CommunityRef;
    // comment_count might be included here, but we'll also fetch comments separately
}

interface CommentData {
    id: string;
    content: string;
    created_at: string;
    post_id: string;
    author_id: string;
    parent_comment_id?: string | null;
    // Joined data
    author: Author;
    // Add replies field if backend structures them hierarchically
    // replies?: CommentData[]; 
}

const API_BASE_URL = 'http://localhost:3001/api/v1';
const locales: { [key: string]: any } = { en: enUS, fr, es }; // For date-fns

// Add more debugging details for API issues
const getErrorDetails = (error: any, context: string): string => {
    if (error instanceof Error) {
        return `${context}: ${error.name} - ${error.message}`;
    }
    return `${context}: ${String(error)}`;
};

// --- Helper Functions (similar to PostItem) ---
const formatRelativeTime = (dateString: string, locale?: any): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale });
  } catch { return dateString; }
};
const formatAbsoluteTime = (dateString: string, locale?: any): string => {
   try {
    return format(parseISO(dateString), 'PPpp', { locale }); // e.g., Sep 21, 2021, 4:33:17 PM
  } catch { return dateString; }
}

// --- Page Component ---
export default function PostDetailPage() {
    const params = useParams();
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user, token, isLoading: authLoading } = useAuth();
    const { status: verificationStatus } = useVerification();
    const isVerified = verificationStatus === 'verified';

    const postId = params?.postId as string;
    const communityId = params?.communityId as string; // Available if needed
    
    console.log('PostDetailPage mounted', { postId, communityId, params });
    
    const currentLocale = locales[i18n.language] || enUS;

    const [post, setPost] = useState<PostData | null>(null);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [postLoading, setPostLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = authLoading || postLoading || commentsLoading;

    // Fetch Post Data
    const fetchPost = useCallback(async () => {
        if (!postId) return;
        console.log('Fetching post data', { postId, url: `${API_BASE_URL}/posts/${postId}` });
        setPostLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
            console.log('Post fetch response', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries([...response.headers])
            });
            
            if (!response.ok) {
                 const errorText = await response.text();
                 console.error(`Fetch post error: ${response.status}`, errorText);
                 if (response.status === 404) {
                    setError(t('post.notFound', 'Post not found'));
                 } else {
                    setError(`Error ${response.status}: ${response.statusText || 'Unknown error'}`);
                 }
                 throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }
            const data: PostData = await response.json();
            console.log('Post data received', data);
            setPost(data);
        } catch (err) {
            console.error(getErrorDetails(err, "Failed to fetch post"));
            if (!error) setError(t('errors.generic', 'Something went wrong. Please try again.'));
        } finally {
            setPostLoading(false);
        }
    }, [postId, t, error]);

    // Fetch Comments Data
    const fetchComments = useCallback(async () => {
        if (!postId) return;
        console.log('Fetching comments', { postId, url: `${API_BASE_URL}/posts/${postId}/comments` });
        setCommentsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
            console.log('Comments fetch response', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                 const errorText = await response.text();
                 console.error(`Fetch comments error: ${response.status}`, errorText);
                 // Don't necessarily overwrite post error
                 if (!error) setError(t('post.commentsError', 'Failed to load comments'));
                 throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }
            
            const rawData = await response.json();
            console.log('Raw comments data received:', rawData);
            
            // Transform the data to ensure consistent format
            const normalizedComments = rawData.map((comment: any) => {
                // If the backend returns 'profiles' instead of 'author', map it
                if (comment.profiles && !comment.author) {
                    return {
                        ...comment,
                        author: {
                            id: comment.profiles.id || comment.author_id,
                            real_name: comment.profiles.real_name || 'Unknown User'
                        }
                    };
                }
                return comment;
            });
            
            console.log('Normalized comments data:', normalizedComments);
            setComments(normalizedComments as CommentData[]);
        } catch (err) {
            console.error(getErrorDetails(err, "Failed to fetch comments"));
             if (!error) setError(t('post.commentsError', 'Failed to load comments'));
        } finally {
            setCommentsLoading(false);
        }
    }, [postId, t, error]);

    // Initial data fetch
    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [fetchPost, fetchComments]);

    // --- Handlers ---
    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewComment(event.target.value);
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !token || !postId || !isVerified) return;

        setIsSubmitting(true);
        setError(null); // Clear previous errors
        
        console.log('Posting new comment', { postId, contentLength: newComment.length });
        
        try {
            const response = await fetch(`${API_BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newComment,
                    post_id: postId,
                    // parent_comment_id: null // Add logic for replies later
                }),
            });

            console.log('Comment submit response', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Post comment error: ${response.status}`, errorText);
                // Try to parse error JSON if available
                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.error || t('post.commentSubmitError', 'Failed to post comment'));
                } catch (e) {
                    setError(`Error ${response.status}: ${response.statusText || errorText}`);
                }
                throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }

            const createdComment: CommentDataType = await response.json();
            console.log('Created comment', createdComment);
            
            // Optimistic update or refetch
            setComments(prev => [...prev, createdComment as CommentData]); // Add type assertion
            setNewComment(''); // Clear input
            
        } catch (err) {
            console.error(getErrorDetails(err, "Failed to post comment"));
            // Error already set in try block potentially
            if (!error) setError(t('post.commentSubmitError', 'Failed to post comment'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Comments Section Render
    const renderCommentsSection = () => {
        if (commentsLoading) {
            return <CircularProgress size={24} sx={{ my: 2 }} />;
        }

        if (comments.length === 0) {
            return (
                <Alert severity="info" sx={{ my: 2 }}>
                    {t('post.noComments', 'No comments yet. Be the first to comment!')}
                </Alert>
            );
        }

        // Group comments by parent_comment_id
        const rootComments = comments.filter(c => !c.parent_comment_id);
        const commentMap = comments.reduce((acc, comment) => {
            if (comment.parent_comment_id) {
                if (!acc[comment.parent_comment_id]) {
                    acc[comment.parent_comment_id] = [];
                }
                acc[comment.parent_comment_id].push(comment);
            }
            return acc;
        }, {} as Record<string, CommentDataType[]>);

        // Simple recursive rendering of comments and their replies
        const renderCommentWithReplies = (comment: CommentDataType) => {
            const replies = commentMap[comment.id] || [];
            return (
                <React.Fragment key={comment.id}>
                    <CommentItem comment={comment} />
                    {replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                </React.Fragment>
            );
        };

        return (
            <Box mt={3}>
                {rootComments.map(renderCommentWithReplies)}
            </Box>
        );
    };

    // --- Render Logic ---
    if (isLoading && !post) { // Show loading indicator until post data arrives at least
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error && !post) { // Show error if post fetch failed critically
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }
    
    if (!post) { // Should ideally be caught by error state, but as fallback
        return (
             <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="info">{t('post.loading')}</Alert> 
            </Container>
        );
    }

    // Basic structure with improved comments section
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Post Display */}
            <Box mb={4}>
                <Typography variant="caption" color="text.secondary" component="div">
                     <MuiLink component={Link} href={createLocalizedUrl(`c/${post?.community?.id || communityId}`)} underline="hover" color="inherit">
                        {post?.community?.name || '...'}
                    </MuiLink>
                    {' • Posted by '}
                    <MuiLink component={Link} href={createLocalizedUrl(`u/${post?.author?.id || ''}`)} underline="hover" color="inherit">
                        {post?.author?.real_name || '...'}
                    </MuiLink>
                    {post?.created_at && (
                        <Tooltip title={formatAbsoluteTime(post.created_at, currentLocale)}>
                            <span>{' • '}{formatRelativeTime(post.created_at, currentLocale)}</span>
                        </Tooltip>
                    )}
                </Typography>
                
                <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3, fontWeight: 'bold' }}>
                    {post?.title || (postLoading ? 'Loading...' : 'Post not found')}
                </Typography>
                
                {post?.content && (
                    <Typography 
                        variant="body1" 
                        component="div" 
                        sx={{ 
                            mt: 2, 
                            mb: 4,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            fontSize: '1.05rem', // Slightly larger font
                            lineHeight: 1.7, // More readable line height
                            color: 'text.primary', // Ensure proper contrast
                            '& p': { mb: 2 }, // Add spacing between paragraphs if any
                            fontWeight: 400 // Normal weight for readability
                        }}
                    >
                        {post.content}
                    </Typography>
                )}
                
                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            </Box>
            
            <Divider />
            
            {/* Comments Section */}
            <Box mt={4} id="comments" sx={{ backgroundColor: 'background.paper' }}>
                <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                        mb: 2, // Reduced margin
                        fontWeight: 500, // Less bold
                        fontSize: '1.2rem', // Smaller heading
                        color: 'text.secondary' // De-emphasized section heading
                    }}
                >
                    {t('post.comments', 'Comments')}
                </Typography>
                
                {/* New Comment Form */}
                {isAuthenticated ? (
                    <>
                        {isVerified ? (
                            <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder={t('post.commentPlaceholder', 'Write a comment...')}
                                    value={newComment}
                                    onChange={handleCommentChange}
                                    disabled={isSubmitting}
                                    sx={{ mb: 2 }}
                                />
                                <Box display="flex" justifyContent="flex-end">
                                    <Button 
                                        variant="contained"
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                {t('post.posting', 'Posting...')}
                                            </>
                                        ) : (
                                            t('post.postComment', 'Post Comment')
                                        )}
                                    </Button>
                                </Box>
                            </Paper>
                        ) : (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                {t('post.verificationRequired', 'You need to verify your account to comment.')}
                            </Alert>
                        )}
                    </>
                ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <MuiLink component={Link} href={createLocalizedUrl('login')} underline="hover">
                            {t('post.loginToComment', 'Log in to comment')}
                        </MuiLink>
                    </Alert>
                )}
                
                {/* Comments List */}
                {renderCommentsSection()}
            </Box>
        </Container>
    );
} 