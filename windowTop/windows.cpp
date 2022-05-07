#include <windows.h>
#include <cstdio>
using namespace std;

unsigned int hw[1];

int main(int argc, char* argv[]) {
	if(argc == 1){
		printf("No argument found");
		return 2;
	}
	hw[0] = atoll(argv[1]);
	HWND hwnd = *(HWND*)hw;
	::SetForegroundWindow(hwnd);
	int ret = ::SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW);
	if(!ret){
		printf("Cannot find window");
		return 1;
	}
	while(1){
		int ret = ::SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW);
		if(!ret)
			break;
		Sleep(100);
	}
	return 0;
}