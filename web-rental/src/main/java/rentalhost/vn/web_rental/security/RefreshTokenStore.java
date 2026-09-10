package rentalhost.vn.web_rental.security;

import java.time.Duration;
import java.util.Set;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component 
@RequiredArgsConstructor 
public class RefreshTokenStore {
   private final StringRedisTemplate redis;

   private String userkey(Long userId){return "user:"+userId+":tokens";}
   private String tokenKey(String token) { return "refresh:" + token; }

   public void save (String token , Long userId , long miliTime){
      redis.opsForValue().set(tokenKey(token), String.valueOf(userId),Duration.ofMillis(miliTime));

      // create a box contain many refresh token , because one personal has refreshtokens
      redis.opsForSet().add(userkey(userId), token);
      /* - gioi han thoi gian song cua box , boi vi 1 refreshtoken tự hết hạn sẽ nằm chết trong đó chứ ko tự dọn dẹp
         - vi the can gioi han thoi gian song cua box , ma do 1 box có thời sống = thời gian refreshtoken nên set chung được
          + nhiều token refresh có 1 thời gian sống chung với nhau 
      */ 
      redis.expire(userkey(userId), Duration.ofMillis(miliTime));
   }


   public Long findUserId(String token){
      String v = redis.opsForValue().get(tokenKey(token));
      return v == null ? null : Long.valueOf(v);
   }

   public void delete(String token , Long userId){
      redis.delete(tokenKey(token));
      redis.opsForSet().remove(userkey(userId), token);
   }

   public void deleteAllByUserId(Long userId){
      Set<String> tokens = redis.opsForSet().members(userkey(userId));
 
      if(tokens != null) redis.delete(tokens.stream().map(this::tokenKey).toList());
      redis.delete(userkey(userId));
   }

}
