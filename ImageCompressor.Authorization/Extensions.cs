using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ImageCompressor.Authorization;

public static class Extensions
{
    public static SymmetricSecurityKey GetSymmetricSecurityKey(this string key)
    {
        return new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key));
    }
}