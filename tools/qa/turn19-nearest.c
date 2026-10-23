#include <stdint.h>
#define MAX 512
__attribute__((import_module("env"),import_name("hypot"))) extern double jhypot(double,double);
static double x[MAX],y[MAX],pressure[MAX],distance;
static int32_t valid[MAX],back[MAX];
__attribute__((export_name("xptr"))) int xptr(){return (int)(uintptr_t)x;}
__attribute__((export_name("yptr"))) int yptr(){return (int)(uintptr_t)y;}
__attribute__((export_name("pptr"))) int pptr(){return (int)(uintptr_t)pressure;}
__attribute__((export_name("vptr"))) int vptr(){return (int)(uintptr_t)valid;}
__attribute__((export_name("bptr"))) int bptr(){return (int)(uintptr_t)back;}
__attribute__((export_name("dist"))) double dist(){return distance;}
__attribute__((export_name("nearest"))) int nearest(int n,double ux,double uy,int preferBack,int lanePenalty,double laneWeight){
 int anyBack=0;if(preferBack)for(int i=0;i<n;i++)if(valid[i]&&back[i]){anyBack=1;break;}
 int best=-1;double score=__builtin_inf(),bd=__builtin_inf();
 for(int i=0;i<n;i++){
  if(!valid[i]||(anyBack&&!back[i]))continue;
  double dx=x[i]-ux,dy=y[i]-uy,bound=score+1.e-12;
  if(dx*dx+dy*dy>=bound*bound)continue;
  double d=jhypot(dx,dy),p=pressure[i];
  double s=d+(p>2.0?(p-2.0)*.035:0.)+(lanePenalty?__builtin_fabs(dy)*laneWeight:0.);
  if(s<score){score=s;bd=d;best=i;}
 }
 distance=bd;return best;
}
